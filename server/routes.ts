import type { Express, Request, Response } from "express";
import { type Server } from "http";
import Razorpay from "razorpay";
import crypto from "crypto";

// Environment variable constants with fallbacks
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ezcoqsyzchjijbwwnhfn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y29xc3l6Y2hqaWpid3duaGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODQxNTQsImV4cCI6MjA4MDc2MDE1NH0.Uig4RSmHuaG_KKluQWM9DXEAUBNQA_g2upsDeOXt3uk';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_7JdZWjXegoBT1F';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '8XpB6yn9vRXCTWo3EgFDmVRW';

// Initialize Razorpay lazily
let razorpay: Razorpay | null = null;

const getRazorpay = () => {
  if (!razorpay) {
    const keyId = RAZORPAY_KEY_ID;
    const keySecret = RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }
    
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

// Shiprocket API Helper
let shiprocketToken: string | null = null;
let shiprocketTokenExpiry: number = 0;

const getShiprocketToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (shiprocketToken && Date.now() < shiprocketTokenExpiry) {
    return shiprocketToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to authenticate with Shiprocket: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  shiprocketToken = data.token;
  // Token valid for 10 days, refresh after 9 days
  shiprocketTokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
  
  return shiprocketToken!;
};

const shiprocketApi = async (endpoint: string, method: string = 'GET', body?: any) => {
  const token = await getShiprocketToken();
  
  const response = await fetch(`https://apiv2.shiprocket.in/v1/external/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Shiprocket API error:', error);
    throw new Error(`Shiprocket API error: ${response.status}`);
  }

  return response.json();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const fetchSupabaseJson = async <T = any>(
    url: string,
    supabaseKey: string,
    label: string,
    fallback?: T
  ): Promise<T> => {
    try {
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      const contentType = response.headers.get('content-type') || '';
      const bodyText = await response.text();

      if (!response.ok) {
        console.error(`${label} failed`, response.status, bodyText.slice(0, 300));
        if (fallback !== undefined) return fallback;
        throw new Error(`${label} failed with status ${response.status}`);
      }

      if (!contentType.includes('application/json')) {
        console.error(`${label} returned non-JSON`, bodyText.slice(0, 300));
        if (fallback !== undefined) return fallback;
        throw new Error(`${label} returned non-JSON`);
      }

      return (bodyText ? JSON.parse(bodyText) : []) as T;
    } catch (error) {
      if (fallback !== undefined) {
        console.error(`${label} error (using fallback):`, error);
        return fallback;
      }
      throw error;
    }
  };

  const parseJsonSafe = <T = any>(text: string, fallback: T): T => {
    try {
      return text ? (JSON.parse(text) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  const incrementCouponTimesUsed = async (couponId: string | null | undefined) => {
    if (!couponId) return;
    try {
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const couponRows = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${couponId}&select=id,times_used&limit=1`,
        supabaseKey,
        'Fetch coupon times_used',
        []
      );
      const currentTimesUsed = Number(couponRows?.[0]?.times_used || 0);

      await fetch(`${supabaseUrl}/rest/v1/coupons?id=eq.${couponId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          times_used: currentTimesUsed + 1,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to increment coupon times_used:', error);
    }
  };

  // Create Razorpay Order
  app.post('/api/create-order', async (req: Request, res: Response) => {
    try {
      const { amount, materialId, productId, userId, guestEmail, deliveryType, shippingAddress } = req.body;

      if (!amount || (!materialId && !productId)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          materialId: materialId || null,
          productId: productId || null,
          userId: userId || 'guest',
          email: guestEmail || '',
          deliveryType: deliveryType || 'digital',
        },
      };

      const order = await getRazorpay().orders.create(options);
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  });

  // Verify Razorpay Payment
  app.post('/api/verify-payment', async (req: Request, res: Response) => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        materialId,
        productId,
        productType,
        userId,
        guestEmail,
        amount,
        originalAmount,
        discountAmount,
        couponId,
        couponCode,
        deliveryType,
        shippingAddress
      } = req.body;

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Payment verified - save to database via Supabase REST API
        const supabaseUrl = SUPABASE_URL;
        const supabaseKey = SUPABASE_SERVICE_KEY;

        const existingPurchases = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/purchases?razorpay_payment_id=eq.${encodeURIComponent(razorpay_payment_id)}&select=id&limit=1`,
          supabaseKey!,
          'Existing payment lookup',
          []
        );
        if (existingPurchases.length > 0) {
          return res.json({ success: true, message: 'Payment already verified' });
        }

        const purchaseData: any = {
          user_id: userId || null,
          guest_email: guestEmail || null,
          material_id: materialId || null,
          product_id: productId || null,
          product_type: productType || 'digital',
          amount: amount,
          original_amount: originalAmount || amount,
          discount_amount: discountAmount || 0,
          coupon_id: couponId || null,
          coupon_code: couponCode || null,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          delivery_type: deliveryType || 'digital',
        };

        // Add shipping info for physical orders
        if (deliveryType === 'physical' && shippingAddress) {
          purchaseData.shipping_address = shippingAddress;
          purchaseData.delivery_status = 'pending';
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/purchases`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(purchaseData),
        });

        const responseText = await response.text();
        const purchaseResult = parseJsonSafe<any[]>(responseText, []);
        const purchaseId = purchaseResult && purchaseResult[0]?.id;

        if (!response.ok) {
          console.error('Error saving purchase:', responseText);
          throw new Error('Failed to save purchase after payment verification');
        }

        // Update coupon usage if coupon was used
        if (couponId && userId && purchaseId) {
          // Record coupon usage with purchase link
          await fetch(`${supabaseUrl}/rest/v1/coupon_usage`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coupon_id: couponId,
              user_id: userId,
              purchase_id: purchaseId,
              discount_applied: discountAmount || 0,
            }),
          });
        }

        await incrementCouponTimesUsed(couponId);

        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
  });

  // Check if user has purchased a material (digital only)
  app.get('/api/check-purchase/:userId/:materialId', async (req: Request, res: Response) => {
    try {
      const { userId, materialId } = req.params;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Only check for digital purchases (not physical/hard copy)
      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?user_id=eq.${userId}&material_id=eq.${materialId}&status=eq.completed&delivery_type=neq.physical&select=id,delivery_type`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();
      const digitalPurchase = data?.find((p: any) => p.delivery_type !== 'physical');
      res.json({ 
        purchased: !!digitalPurchase,
        delivery_type: digitalPurchase?.delivery_type || null
      });
    } catch (error: any) {
      console.error('Error checking purchase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/purchases/sync-guest', async (req: Request, res: Response) => {
    try {
      const { userId, email } = req.body;

      if (!userId || !email) {
        return res.status(400).json({ error: 'userId and email are required' });
      }

      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;
      const normalizedEmail = String(email).trim().toLowerCase();

      const guestPurchases = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/purchases?guest_email=ilike.${encodeURIComponent(normalizedEmail)}&user_id=is.null&status=eq.completed&select=id`,
        supabaseKey!,
        'Guest purchase sync lookup',
        []
      );

      if (!guestPurchases.length) {
        return res.json({ success: true, synced: 0 });
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?guest_email=ilike.${encodeURIComponent(normalizedEmail)}&user_id=is.null&status=eq.completed`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to sync guest purchases');
      }

      res.json({ success: true, synced: guestPurchases.length });
    } catch (error: any) {
      console.error('Error syncing guest purchases:', error);
      res.status(500).json({ error: error.message || 'Failed to sync guest purchases' });
    }
  });

  // Get user's purchases with material details
  app.get('/api/purchases/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?user_id=eq.${userId}&status=eq.completed&select=*,material:study_materials(id,title,slug,file_url,thumbnail_url,material_type),product:hard_copy_products(id,title,slug)&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update order status (admin)
  app.patch('/api/orders/:orderId', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { delivery_status, tracking_number, admin_notes } = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const updateData: any = {
        delivery_status,
        tracking_number,
        admin_notes,
        updated_at: new Date().toISOString(),
      };

      if (delivery_status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }
      if (delivery_status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SHIPROCKET INTEGRATION ============

  // Create Shiprocket shipment for an order
  app.post('/api/shiprocket/create-order', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Fetch order details with both material and product relations
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}&select=*,material:study_materials(title),product:hard_copy_products(title,weight_kg,dimensions_cm)`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const orders = await orderRes.json();
      if (!orders || orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const order = orders[0];
      const address = order.shipping_address;
      
      if (!address) {
        return res.status(400).json({ error: 'No shipping address found' });
      }

      // Get product details (from either material or hard_copy_product)
      const productTitle = order.product?.title || order.material?.title || 'Study Material';
      const productId = order.product_id || order.material_id;
      const weight = order.product?.weight_kg || 0.5;
      const dims = order.product?.dimensions_cm?.split('x') || ['25', '20', '3'];

      // Create Shiprocket order
      const shiprocketOrder = await shiprocketApi('orders/create/adhoc', 'POST', {
        order_id: orderId.slice(0, 20), // Shiprocket has 20 char limit
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
        billing_customer_name: address.name,
        billing_last_name: '',
        billing_address: address.address_line1,
        billing_address_2: address.address_line2 || '',
        billing_city: address.city,
        billing_pincode: address.pincode,
        billing_state: address.state,
        billing_country: 'India',
        billing_email: order.user_email || 'customer@neetpeak.com',
        billing_phone: address.phone,
        shipping_is_billing: true,
        order_items: [
          {
            name: productTitle,
            sku: `PROD-${productId?.slice(0, 8) || 'UNKNOWN'}`,
            units: 1,
            selling_price: order.amount,
            discount: 0,
            tax: 0,
          }
        ],
        payment_method: 'Prepaid',
        sub_total: order.amount,
        length: parseInt(dims[0]) || 25,
        breadth: parseInt(dims[1]) || 20,
        height: parseInt(dims[2]) || 3,
        weight: weight,
      });

      // Update order with Shiprocket order ID
      await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shiprocket_order_id: shiprocketOrder.order_id,
            shiprocket_shipment_id: shiprocketOrder.shipment_id,
            delivery_status: 'processing',
          }),
        }
      );

      res.json({ 
        success: true, 
        shiprocket_order_id: shiprocketOrder.order_id,
        shipment_id: shiprocketOrder.shipment_id 
      });
    } catch (error: any) {
      console.error('Shiprocket create order error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get available couriers for a shipment
  app.post('/api/shiprocket/couriers', async (req: Request, res: Response) => {
    try {
      const { pickup_pincode, delivery_pincode, weight, cod } = req.body;
      
      const pickupCode = pickup_pincode || process.env.SHIPROCKET_PICKUP_PINCODE || '302019';
      const deliveryCode = delivery_pincode;
      const shipWeight = weight || 0.5;
      const isCod = cod ? 1 : 0;
      
      // Shiprocket serviceability API uses GET with query params, not POST
      const queryParams = new URLSearchParams({
        pickup_postcode: pickupCode,
        delivery_postcode: deliveryCode,
        weight: shipWeight.toString(),
        cod: isCod.toString(),
      });
      
      const couriers = await shiprocketApi(`courier/serviceability/?${queryParams.toString()}`, 'GET');

      res.json(couriers);
    } catch (error: any) {
      console.error('Shiprocket couriers error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate AWB (Air Waybill) and schedule pickup
  app.post('/api/shiprocket/ship', async (req: Request, res: Response) => {
    try {
      const { orderId, courier_id } = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Get order's shipment ID
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}&select=shiprocket_shipment_id`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const orders = await orderRes.json();
      if (!orders?.[0]?.shiprocket_shipment_id) {
        return res.status(400).json({ error: 'Shipment not created yet' });
      }

      const shipment_id = orders[0].shiprocket_shipment_id;

      // Generate AWB
      const awbResponse = await shiprocketApi('courier/assign/awb', 'POST', {
        shipment_id,
        courier_id,
      });

      // Schedule pickup
      const pickupResponse = await shiprocketApi('courier/generate/pickup', 'POST', {
        shipment_id: [shipment_id],
      });

      // Update order with tracking info
      await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tracking_number: awbResponse.response?.data?.awb_code,
            delivery_status: 'shipped',
            shipped_at: new Date().toISOString(),
          }),
        }
      );

      res.json({ 
        success: true, 
        awb: awbResponse.response?.data?.awb_code,
        pickup: pickupResponse 
      });
    } catch (error: any) {
      console.error('Shiprocket ship error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Track shipment
  app.get('/api/shiprocket/track/:awb', async (req: Request, res: Response) => {
    try {
      const { awb } = req.params;
      
      const tracking = await shiprocketApi(`courier/track/awb/${awb}`);
      res.json(tracking);
    } catch (error: any) {
      console.error('Shiprocket tracking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ COUPON SYSTEM ============

  // Validate coupon code for a specific material
  app.post('/api/coupons/validate', async (req: Request, res: Response) => {
    try {
      const { code, materialId, productId, productType, deliveryType, userId } = req.body;
      const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
      
      // Support both materialId and productId
      const itemId = productId || materialId;
      const isHardCopy = productType === 'hardcopy' || deliveryType === 'physical';
      
      if (!normalizedCode || !itemId) {
        return res.status(400).json({ valid: false, error: 'Missing coupon code or product ID' });
      }

      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not configured');
        return res.status(500).json({ valid: false, error: 'Server configuration error' });
      }

      // Fetch coupon by code
      const couponUrl = `${supabaseUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(normalizedCode)}&select=*&limit=1`;
      const coupons = await fetchSupabaseJson<any[]>(
        couponUrl,
        supabaseKey,
        'Coupon lookup',
        []
      );
      if (!coupons || coupons.length === 0) {
        return res.json({ valid: false, error: 'Invalid coupon code' });
      }

      const coupon = coupons[0];

      // Check if coupon is active
      if (!coupon.is_active) {
        return res.json({ valid: false, error: 'This coupon is no longer active' });
      }

      // Check date validity
      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        return res.json({ valid: false, error: 'This coupon is not yet active' });
      }
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        return res.json({ valid: false, error: 'This coupon has expired' });
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        return res.json({ valid: false, error: 'This coupon has reached its usage limit' });
      }

      // Check if user already used this coupon (if userId provided)
      if (userId) {
        const usageData = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/coupon_usage?coupon_id=eq.${coupon.id}&user_id=eq.${userId}&select=id`,
          supabaseKey,
          'Coupon usage lookup',
          []
        );
        if (usageData && usageData.length > 0) {
          return res.json({ valid: false, error: 'You have already used this coupon' });
        }
      }

      // Check for product-specific discount - check BOTH material_id and product_id
      let productDiscounts: any[] = [];
      
      if (isHardCopy) {
        // For hard copy products, check product_id column
        productDiscounts = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${coupon.id}&product_id=eq.${itemId}&select=*`,
          supabaseKey,
          'Coupon product lookup (hard copy)',
          []
        );
      } else {
        // For digital materials, check material_id column
        productDiscounts = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${coupon.id}&material_id=eq.${itemId}&select=*`,
          supabaseKey,
          'Coupon product lookup (digital)',
          []
        );
      }
      
      let discountValue = coupon.default_discount_value || 0;
      let appliesTo = 'both';

      if (productDiscounts && productDiscounts.length > 0) {
        const productDiscount = productDiscounts[0];
        discountValue = productDiscount.discount_value;
        appliesTo = productDiscount.applies_to;
      }

      // Check if discount applies to the delivery type
      // Map delivery types: 'physical' = 'hard_copy', 'digital' = 'digital'
      const mappedDeliveryType = deliveryType === 'physical' ? 'hard_copy' : deliveryType;
      if (mappedDeliveryType && appliesTo !== 'both' && appliesTo !== mappedDeliveryType) {
        return res.json({ 
          valid: false, 
          error: `This coupon only applies to ${appliesTo === 'digital' ? 'digital downloads' : 'hard copies'}` 
        });
      }

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: discountValue,
          max_discount_amount: coupon.max_discount_amount,
          min_purchase_amount: coupon.min_purchase_amount,
          applies_to: appliesTo,
        }
      });
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
    }
  });

  // Validate coupon for cart (general validation without specific product)
  app.post('/api/coupons/validate-cart', async (req: Request, res: Response) => {
    try {
      const { code, cartTotal, userId, items } = req.body;
      const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
      
      if (!normalizedCode) {
        return res.status(400).json({ valid: false, error: 'Missing coupon code' });
      }

      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Fetch coupon by code
      const coupons = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(normalizedCode)}&select=*&limit=1`,
        supabaseKey!,
        'Cart coupon lookup',
        []
      );
      
      if (!coupons || coupons.length === 0) {
        return res.json({ valid: false, error: 'Invalid coupon code' });
      }

      const coupon = coupons[0];

      // Check if coupon is active
      if (!coupon.is_active) {
        return res.json({ valid: false, error: 'This coupon is no longer active' });
      }

      // Check date validity
      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        return res.json({ valid: false, error: 'This coupon is not yet active' });
      }
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        return res.json({ valid: false, error: 'This coupon has expired' });
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        return res.json({ valid: false, error: 'This coupon has reached its usage limit' });
      }

      // Check minimum purchase amount
      if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
        return res.json({ valid: false, error: `Minimum order amount is ₹${coupon.min_purchase_amount}` });
      }

      // Check if user already used this coupon
      if (userId) {
        const usageData = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/coupon_usage?coupon_id=eq.${coupon.id}&user_id=eq.${userId}&select=id`,
          supabaseKey!,
          'Cart coupon usage lookup',
          []
        );
        if (usageData && usageData.length > 0) {
          return res.json({ valid: false, error: 'You have already used this coupon' });
        }
      }

      // Calculate applicable discount for cart items
      let applicableDiscount = 0;
      let discountValue = coupon.default_discount_value || 0;
      
      // If coupon has default discount, apply to all items
      if (discountValue > 0) {
        if (coupon.discount_type === 'percentage') {
          applicableDiscount = Math.round(cartTotal * discountValue / 100);
          if (coupon.max_discount_amount) {
            applicableDiscount = Math.min(applicableDiscount, coupon.max_discount_amount);
          }
        } else {
          applicableDiscount = discountValue;
        }
      } else if (items && items.length > 0) {
        // Product-specific coupon - check each cart item
        const couponProducts = await fetchSupabaseJson<any[]>(
          `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${coupon.id}&select=*`,
          supabaseKey!,
          'Cart coupon products lookup',
          []
        );
        
        if (couponProducts && couponProducts.length > 0) {
          // Check each cart item against coupon products
          for (const item of items) {
            const isHardCopy = item.type === 'hardcopy';
            const matchingProduct = couponProducts.find((cp: any) => 
              isHardCopy ? cp.product_id === item.id : cp.material_id === item.id
            );
            
            if (matchingProduct) {
              // Apply product-specific discount
              if (coupon.discount_type === 'percentage') {
                applicableDiscount += Math.round(item.price * matchingProduct.discount_value / 100);
              } else {
                applicableDiscount += matchingProduct.discount_value;
              }
            }
          }
        }
      }

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: discountValue,
          applicable_discount: applicableDiscount,
          max_discount_amount: coupon.max_discount_amount,
          min_purchase_amount: coupon.min_purchase_amount,
        }
      });
    } catch (error: any) {
      console.error('Cart coupon validation error:', error);
      res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
    }
  });

  // Get all coupons (admin)
  app.get('/api/admin/coupons', async (req: Request, res: Response) => {
    try {
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const coupons = await response.json();

      const purchases = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/purchases?status=eq.completed&coupon_id=not.is.null&select=coupon_id,discount_amount,razorpay_order_id,id`,
        supabaseKey!,
        'Coupon sales lookup',
        []
      );

      const salesByCoupon = new Map<string, { orderIds: Set<string>; total: number }>();
      for (const p of purchases) {
        const couponId = p?.coupon_id as string | undefined;
        if (!couponId) continue;
        const prev = salesByCoupon.get(couponId) || { orderIds: new Set<string>(), total: 0 };
        const orderKey = String(p?.razorpay_order_id || p?.id || '');
        if (orderKey) {
          prev.orderIds.add(orderKey);
        }
        salesByCoupon.set(couponId, {
          orderIds: prev.orderIds,
          total: prev.total + Number(p?.discount_amount || 0),
        });
      }

      const enrichedCoupons = (coupons || []).map((c: any) => {
        const sales = salesByCoupon.get(c.id) || { orderIds: new Set<string>(), total: 0 };
        return {
          ...c,
          paid_usage_count: sales.orderIds.size,
          paid_discount_total: sales.total,
        };
      });

      res.json(enrichedCoupons);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create coupon (admin)
  app.post('/api/admin/coupons', async (req: Request, res: Response) => {
    try {
      const couponData = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Create coupon
      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            code: couponData.code.toUpperCase(),
            description: couponData.description,
            discount_type: couponData.discount_type,
            default_discount_value: couponData.default_discount_value,
            is_active: couponData.is_active ?? true,
            start_date: couponData.start_date,
            end_date: couponData.end_date,
            usage_limit: couponData.usage_limit,
            min_purchase_amount: couponData.min_purchase_amount,
            max_discount_amount: couponData.max_discount_amount,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      res.json(data[0]);
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update coupon (admin)
  app.patch('/api/admin/coupons/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const couponData = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            ...couponData,
            code: couponData.code?.toUpperCase(),
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }

      const data = await response.json();
      res.json(data[0]);
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete coupon (admin)
  app.delete('/api/admin/coupons/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const existingCoupon = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${id}&select=id&limit=1`,
        supabaseKey!,
        'Coupon existence check',
        []
      );
      if (!existingCoupon.length) {
        return res.status(404).json({ success: false, error: 'Coupon not found' });
      }

      // First delete related coupon_products (CASCADE should handle this, but let's be explicit)
      const clearPurchasesRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?coupon_id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coupon_id: null }),
        }
      );
      if (!clearPurchasesRes.ok) {
        const errorText = await clearPurchasesRes.text();
        console.error('Clear purchases coupon_id error:', errorText);
        throw new Error('Failed to detach coupon from existing purchases');
      }

      await fetch(
        `${supabaseUrl}/rest/v1/coupon_usage?coupon_id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const deleteProductsRes = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      if (!deleteProductsRes.ok) {
        const errorText = await deleteProductsRes.text();
        console.error('Delete coupon_products error:', errorText);
      }

      // Then delete the coupon
      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete coupon error:', errorText);
        throw new Error('Failed to delete coupon. It may be in use by existing orders.');
      }

      const stillExists = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${id}&select=id&limit=1`,
        supabaseKey!,
        'Coupon delete verification',
        []
      );
      if (stillExists.length > 0) {
        return res.status(500).json({ success: false, error: 'Coupon delete was not applied in database' });
      }

      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ error: error.message || 'Failed to delete coupon' });
    }
  });

  // Get coupon product discounts (admin)
  app.get('/api/admin/coupons/:id/products', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Fetch coupon products with both material and hard copy product relations
      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${id}&select=*,material:study_materials(id,title),product:hard_copy_products(id,title)`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();
      
      // Normalize the response to always have a material object with title
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        material: item.material || (item.product ? { id: item.product.id, title: `📦 ${item.product.title}` } : null),
      }));
      
      res.json(normalizedData);
    } catch (error: any) {
      console.error('Error fetching coupon products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add product discount to coupon (admin)
  app.post('/api/admin/coupons/:id/products', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { material_id, product_id, discount_value, applies_to } = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Build the data object - only include non-null IDs
      const insertData: any = {
        coupon_id: id,
        discount_value,
        applies_to: applies_to || 'both',
      };
      
      if (material_id) {
        insertData.material_id = material_id;
      }
      if (product_id) {
        insertData.product_id = product_id;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(insertData),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      res.json(data[0]);
    } catch (error: any) {
      console.error('Error adding product discount:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Remove product discount from coupon (admin)
  app.delete('/api/admin/coupon-products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product discount');
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting product discount:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel shipment
  app.post('/api/shiprocket/cancel', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      
      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;

      // Get Shiprocket order IDs
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}&select=shiprocket_order_id`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const orders = await orderRes.json();
      if (!orders?.[0]?.shiprocket_order_id) {
        return res.status(400).json({ error: 'No Shiprocket order found' });
      }

      const cancelResponse = await shiprocketApi('orders/cancel', 'POST', {
        ids: [orders[0].shiprocket_order_id],
      });

      // Update order status
      await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            delivery_status: 'cancelled',
          }),
        }
      );

      res.json({ success: true, response: cancelResponse });
    } catch (error: any) {
      console.error('Shiprocket cancel error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CART CHECKOUT ============

  // Create cart order
  app.post('/api/create-cart-order', async (req: Request, res: Response) => {
    try {
      const { items, amount, userId, guestEmail } = req.body;

      if (!items || items.length === 0 || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `cart_${Date.now()}`,
        notes: {
          itemCount: items.length,
          userId: userId || 'guest',
          email: guestEmail || '',
        },
      };

      const order = await getRazorpay().orders.create(options);
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      console.error('Error creating cart order:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  });

  // Verify cart payment and create purchases
  app.post('/api/verify-cart-payment', async (req: Request, res: Response) => {
    try {
      const { 
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        items, userId, guestEmail, amount, originalAmount, discountAmount,
        couponId, couponCode, hasPhysical, shippingAddress
      } = req.body;

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }

      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_SERVICE_KEY;
      const existingPurchases = await fetchSupabaseJson<any[]>(
        `${supabaseUrl}/rest/v1/purchases?razorpay_payment_id=eq.${encodeURIComponent(razorpay_payment_id)}&select=id&limit=1`,
        supabaseKey!,
        'Existing cart payment lookup',
        []
      );
      if (existingPurchases.length > 0) {
        return res.json({ success: true, message: 'Cart payment already verified' });
      }
      const itemSubtotals = items.map((item: any) => Number(item.price || 0) * Number(item.quantity || 1));
      const computedOriginalTotal = itemSubtotals.reduce((sum: number, v: number) => sum + v, 0);
      const cartOriginalTotal = Math.max(Number(originalAmount ?? computedOriginalTotal), 0);
      const requestedDiscount = Math.max(Number(discountAmount || 0), 0);
      const totalDiscountToAllocate = Math.min(requestedDiscount, cartOriginalTotal);
      let allocatedDiscount = 0;

      // Store purchase IDs for coupon tracking
      const purchaseIds: string[] = [];

      // Create purchase record for each item
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const itemSubtotal = itemSubtotals[index] || 0;
        const itemDiscount = totalDiscountToAllocate <= 0
          ? 0
          : (index === items.length - 1
              ? Math.max(totalDiscountToAllocate - allocatedDiscount, 0)
              : Math.floor((itemSubtotal / Math.max(cartOriginalTotal, 1)) * totalDiscountToAllocate));
        allocatedDiscount += itemDiscount;
        const itemFinalAmount = Math.max(itemSubtotal - itemDiscount, 0);

        const purchaseData: any = {
          user_id: userId || null,
          guest_email: guestEmail || null,
          material_id: item.type === 'digital' ? item.id : null,
          product_id: item.type === 'hardcopy' ? item.id : null,
          product_type: item.type === 'digital' ? 'digital' : 'hardcopy',
          amount: itemFinalAmount,
          original_amount: itemSubtotal,
          discount_amount: itemDiscount,
          coupon_id: couponId || null,
          coupon_code: couponCode || null,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          delivery_type: item.type === 'hardcopy' ? 'physical' : 'digital',
        };

        if (item.type === 'hardcopy' && shippingAddress) {
          purchaseData.shipping_address = shippingAddress;
          purchaseData.delivery_status = 'pending';
        }

        const purchaseResponse = await fetch(`${supabaseUrl}/rest/v1/purchases`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(purchaseData),
        });

        const purchaseText = await purchaseResponse.text();
        const purchaseResult = parseJsonSafe<any[]>(purchaseText, []);
        if (!purchaseResponse.ok) {
          throw new Error(`Failed to save cart purchase item: ${purchaseText}`);
        }
        if (purchaseResult && purchaseResult[0]?.id) {
          purchaseIds.push(purchaseResult[0].id);
        }
      }

      // Update coupon usage if used - link to first purchase
      if (couponId && userId && purchaseIds.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/coupon_usage`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coupon_id: couponId,
            user_id: userId,
            purchase_id: purchaseIds[0], // Link to first purchase in the order
            discount_applied: discountAmount || 0,
          }),
        });
      }
      await incrementCouponTimesUsed(couponId);

      res.json({ success: true, message: 'Payment verified and purchases created' });
    } catch (error: any) {
      console.error('Error verifying cart payment:', error);
      res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
  });

  return httpServer;
}
