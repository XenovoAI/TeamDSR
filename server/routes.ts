import type { Express, Request, Response } from "express";
import { type Server } from "http";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay lazily
let razorpay: Razorpay | null = null;

const getRazorpay = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
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
    throw new Error('Shiprocket credentials not configured');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket');
  }

  const data = await response.json();
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

  // Create Razorpay Order
  app.post('/api/create-order', async (req: Request, res: Response) => {
    try {
      const { amount, materialId, userId, deliveryType, shippingAddress } = req.body;

      if (!amount || !materialId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `material_${materialId}_${Date.now()}`,
        notes: {
          materialId,
          userId,
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
        userId,
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
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        const purchaseData: any = {
          user_id: userId,
          material_id: materialId,
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

        if (!response.ok) {
          const error = await response.text();
          console.error('Error saving purchase:', error);
        }

        // Update coupon usage if coupon was used
        if (couponId) {
          // Increment times_used
          await fetch(`${supabaseUrl}/rest/v1/rpc/increment_coupon_usage`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey!,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coupon_id: couponId }),
          }).catch(() => {
            // Fallback: direct update
            fetch(`${supabaseUrl}/rest/v1/coupons?id=eq.${couponId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey!,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ times_used: 1 }), // Will be incremented by trigger or manually
            });
          });

          // Record coupon usage
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
              discount_applied: discountAmount || 0,
            }),
          });
        }

        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
  });

  // Check if user has purchased a material
  app.get('/api/check-purchase/:userId/:materialId', async (req: Request, res: Response) => {
    try {
      const { userId, materialId } = req.params;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?user_id=eq.${userId}&material_id=eq.${materialId}&status=eq.completed&select=id`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();
      res.json({ purchased: data && data.length > 0 });
    } catch (error: any) {
      console.error('Error checking purchase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's purchases with material details
  app.get('/api/purchases/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/purchases?user_id=eq.${userId}&status=eq.completed&select=*,material:study_materials(id,title,slug,file_url,thumbnail_url,material_type)&order=created_at.desc`,
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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      // Fetch order details
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/purchases?id=eq.${orderId}&select=*,material:study_materials(title,hard_copy_price)`,
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
            name: order.material?.title || 'Study Material',
            sku: `MAT-${order.material_id?.slice(0, 8)}`,
            units: 1,
            selling_price: order.amount,
            discount: 0,
            tax: 0,
          }
        ],
        payment_method: 'Prepaid',
        sub_total: order.amount,
        length: 25, // cm - adjust based on your book size
        breadth: 20,
        height: 3,
        weight: 0.5, // kg - adjust based on your book weight
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
      
      const couriers = await shiprocketApi('courier/serviceability/', 'POST', {
        pickup_postcode: pickup_pincode || process.env.SHIPROCKET_PICKUP_PINCODE,
        delivery_postcode: delivery_pincode,
        weight: weight || 0.5,
        cod: cod ? 1 : 0,
      });

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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
      const { code, materialId, deliveryType, userId } = req.body;
      
      console.log('Validating coupon:', { code, materialId, deliveryType, userId });
      
      if (!code || !materialId) {
        return res.status(400).json({ valid: false, error: 'Missing coupon code or material ID' });
      }

      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not configured');
        return res.status(500).json({ valid: false, error: 'Server configuration error' });
      }

      // Fetch coupon by code
      const couponUrl = `${supabaseUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=*`;
      console.log('Fetching coupon from:', couponUrl);
      
      const couponRes = await fetch(couponUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (!couponRes.ok) {
        const errorText = await couponRes.text();
        console.error('Coupon fetch error:', couponRes.status, errorText);
        return res.status(500).json({ valid: false, error: 'Failed to fetch coupon' });
      }

      const coupons = await couponRes.json();
      console.log('Coupons found:', coupons?.length || 0);
      
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
        const usageRes = await fetch(
          `${supabaseUrl}/rest/v1/coupon_usage?coupon_id=eq.${coupon.id}&user_id=eq.${userId}&select=id`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        );
        const usageData = await usageRes.json();
        if (usageData && usageData.length > 0) {
          return res.json({ valid: false, error: 'You have already used this coupon' });
        }
      }

      // Check for product-specific discount
      const productRes = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${coupon.id}&material_id=eq.${materialId}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const productDiscounts = await productRes.json();
      
      let discountValue = coupon.default_discount_value || 0;
      let appliesTo = 'both';

      if (productDiscounts && productDiscounts.length > 0) {
        const productDiscount = productDiscounts[0];
        discountValue = productDiscount.discount_value;
        appliesTo = productDiscount.applies_to;
      }

      // Check if discount applies to the delivery type
      if (deliveryType && appliesTo !== 'both' && appliesTo !== deliveryType) {
        return res.json({ 
          valid: false, 
          error: `This coupon only applies to ${appliesTo === 'digital' ? 'digital downloads' : 'hard copies'}` 
        });
      }

      console.log('Coupon valid:', coupon.code, 'Discount:', discountValue);

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

  // Get all coupons (admin)
  app.get('/api/admin/coupons', async (req: Request, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons?select=*&order=created_at.desc`,
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
      console.error('Error fetching coupons:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create coupon (admin)
  app.post('/api/admin/coupons', async (req: Request, res: Response) => {
    try {
      const couponData = req.body;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupons?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get coupon product discounts (admin)
  app.get('/api/admin/coupons/:id/products', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/coupon_products?coupon_id=eq.${id}&select=*,material:study_materials(id,title)`,
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
      console.error('Error fetching coupon products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add product discount to coupon (admin)
  app.post('/api/admin/coupons/:id/products', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { material_id, discount_value, applies_to } = req.body;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
          body: JSON.stringify({
            coupon_id: id,
            material_id,
            discount_value,
            applies_to: applies_to || 'both',
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
      console.error('Error adding product discount:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Remove product discount from coupon (admin)
  app.delete('/api/admin/coupon-products/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
      
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

  return httpServer;
}
