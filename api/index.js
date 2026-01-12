import Razorpay from 'razorpay';
import crypto from 'crypto';

const getSupabaseConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
});

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// Shiprocket Auth
const getShiprocketToken = async () => {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error('Shiprocket credentials not configured');
  
  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Shiprocket auth failed: ${err}`);
  }
  const data = await response.json();
  return data.token;
};

const shiprocketApi = async (endpoint, method = 'GET', body = null) => {
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
    const err = await response.text();
    throw new Error(`Shiprocket API error: ${err}`);
  }
  return response.json();
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url: path } = req;
  const method = req.method;

  try {
    // Create Order
    if (path.includes('/api/create-order') && method === 'POST') {
      const { amount, materialId, productId, userId, guestEmail } = req.body;
      if (!amount || (!materialId && !productId)) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const rp = getRazorpay();
      if (!rp) {
        return res.status(500).json({ error: 'Razorpay not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars.' });
      }
      const order = await rp.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: { userId: userId || 'guest', email: guestEmail || '' }
      });
      return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
    }


    // Verify Payment
    if (path.includes('/api/verify-payment') && method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, materialId, productId, productType, userId, guestEmail, amount, originalAmount, discountAmount, couponId, couponCode, deliveryType, shippingAddress } = req.body;
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Verification failed' });
      }
      const { url, key } = getSupabaseConfig();
      const purchaseData = {
        user_id: userId || null,
        guest_email: guestEmail || null,
        material_id: materialId || null,
        product_id: productId || null,
        product_type: productType || 'digital',
        amount, 
        original_amount: originalAmount || amount,
        discount_amount: discountAmount || 0, 
        coupon_id: couponId || null, 
        coupon_code: couponCode || null,
        razorpay_order_id, razorpay_payment_id, razorpay_signature, 
        status: 'completed',
        delivery_type: deliveryType || 'digital',
      };
      if (deliveryType === 'physical' && shippingAddress) {
        purchaseData.shipping_address = shippingAddress;
        purchaseData.delivery_status = 'pending';
      }
      await fetch(`${url}/rest/v1/purchases`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });
      return res.json({ success: true });
    }

    // Check Purchase (digital only - not physical)
    if (path.includes('/api/check-purchase/') && method === 'GET') {
      const parts = path.split('/');
      const materialId = parts.pop();
      const userId = parts.pop();
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/purchases?user_id=eq.${userId}&material_id=eq.${materialId}&status=eq.completed&delivery_type=neq.physical&select=id,delivery_type`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const data = await response.json();
      const digitalPurchase = data?.find((p) => p.delivery_type !== 'physical');
      return res.json({ 
        purchased: !!digitalPurchase,
        delivery_type: digitalPurchase?.delivery_type || null
      });
    }

    // Get Purchases
    if (path.match(/\/api\/purchases\/[^/]+$/) && method === 'GET') {
      const userId = path.split('/').pop();
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/purchases?user_id=eq.${userId}&status=eq.completed&select=*,material:study_materials(id,title,slug,file_url,thumbnail_url,material_type)&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      return res.json(await response.json());
    }


    // Validate Coupon
    if (path.includes('/api/coupons/validate') && method === 'POST') {
      const { code, materialId, deliveryType, userId } = req.body;
      if (!code || !materialId) return res.status(400).json({ valid: false, error: 'Missing code or material ID' });
      const { url, key } = getSupabaseConfig();
      if (!url || !key) return res.status(500).json({ valid: false, error: 'Server config error' });
      
      const couponRes = await fetch(`${url}/rest/v1/coupons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const coupons = await couponRes.json();
      if (!coupons?.length) return res.json({ valid: false, error: 'Invalid coupon code' });
      
      const coupon = coupons[0];
      if (!coupon.is_active) return res.json({ valid: false, error: 'Coupon not active' });
      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) return res.json({ valid: false, error: 'Coupon not yet active' });
      if (coupon.end_date && new Date(coupon.end_date) < now) return res.json({ valid: false, error: 'Coupon expired' });
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) return res.json({ valid: false, error: 'Usage limit reached' });
      
      if (userId) {
        const usageRes = await fetch(`${url}/rest/v1/coupon_usage?coupon_id=eq.${coupon.id}&user_id=eq.${userId}&select=id`, {
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
        });
        const usageData = await usageRes.json();
        if (usageData?.length) return res.json({ valid: false, error: 'Already used this coupon' });
      }
      
      const productRes = await fetch(`${url}/rest/v1/coupon_products?coupon_id=eq.${coupon.id}&material_id=eq.${materialId}&select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const productDiscounts = await productRes.json();
      let discountValue = coupon.default_discount_value || 0;
      let appliesTo = 'both';
      if (productDiscounts?.length) {
        discountValue = productDiscounts[0].discount_value;
        appliesTo = productDiscounts[0].applies_to;
      }
      if (deliveryType && appliesTo !== 'both' && appliesTo !== deliveryType) {
        return res.json({ valid: false, error: `Only applies to ${appliesTo}` });
      }
      return res.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discount_type: coupon.discount_type, discount_value: discountValue, max_discount_amount: coupon.max_discount_amount } });
    }


    // Admin Coupons - GET all
    if (path === '/api/admin/coupons' && method === 'GET') {
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/coupons?select=*&order=created_at.desc`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      return res.json(await response.json());
    }

    // Admin Coupons - POST create
    if (path === '/api/admin/coupons' && method === 'POST') {
      const data = req.body;
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/coupons`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ code: data.code?.toUpperCase(), description: data.description, discount_type: data.discount_type, default_discount_value: data.default_discount_value, is_active: data.is_active ?? true, start_date: data.start_date, end_date: data.end_date, usage_limit: data.usage_limit, min_purchase_amount: data.min_purchase_amount, max_discount_amount: data.max_discount_amount }),
      });
      const result = await response.json();
      return res.json(result[0] || result);
    }

    // Admin Coupons - PATCH update
    if (path.match(/\/api\/admin\/coupons\/[^/]+$/) && method === 'PATCH') {
      const id = path.split('/').pop();
      const data = req.body;
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/coupons?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...data, code: data.code?.toUpperCase(), updated_at: new Date().toISOString() }),
      });
      const result = await response.json();
      return res.json(result[0] || result);
    }

    // Admin Coupons - DELETE
    if (path.match(/\/api\/admin\/coupons\/[^/]+$/) && method === 'DELETE') {
      const id = path.split('/').pop();
      const { url, key } = getSupabaseConfig();
      await fetch(`${url}/rest/v1/coupons?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      return res.json({ success: true });
    }

    // Admin Coupon Products - GET
    if (path.match(/\/api\/admin\/coupons\/[^/]+\/products$/) && method === 'GET') {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/coupon_products?coupon_id=eq.${id}&select=*,material:study_materials(id,title)`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      return res.json(await response.json());
    }

    // Admin Coupon Products - POST
    if (path.match(/\/api\/admin\/coupons\/[^/]+\/products$/) && method === 'POST') {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      const { material_id, discount_value, applies_to } = req.body;
      const { url, key } = getSupabaseConfig();
      const response = await fetch(`${url}/rest/v1/coupon_products`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ coupon_id: id, material_id, discount_value, applies_to: applies_to || 'both' }),
      });
      const result = await response.json();
      return res.json(result[0] || result);
    }

    // Admin Coupon Products - DELETE
    if (path.includes('/api/admin/coupon-products/') && method === 'DELETE') {
      const id = path.split('/').pop();
      const { url, key } = getSupabaseConfig();
      await fetch(`${url}/rest/v1/coupon_products?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      return res.json({ success: true });
    }

    // ============ SHIPROCKET ENDPOINTS ============

    // Create Shiprocket Order
    if (path.includes('/api/shiprocket/create-order') && method === 'POST') {
      const { orderId } = req.body;
      const { url, key } = getSupabaseConfig();
      
      // Fetch order details with both material and product relations
      const orderRes = await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}&select=*,material:study_materials(title),product:hard_copy_products(title,weight_kg,dimensions_cm)`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const orders = await orderRes.json();
      if (!orders?.length) return res.status(404).json({ error: 'Order not found' });
      
      const order = orders[0];
      const address = order.shipping_address;
      if (!address) return res.status(400).json({ error: 'No shipping address' });

      // Get product details (from either material or hard_copy_product)
      const productTitle = order.product?.title || order.material?.title || 'Study Material';
      const productId = order.product_id || order.material_id;
      const weight = order.product?.weight_kg || 0.5;
      const dims = order.product?.dimensions_cm?.split('x') || ['25', '20', '3'];

      const shiprocketOrder = await shiprocketApi('orders/create/adhoc', 'POST', {
        order_id: orderId.slice(0, 20),
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
        billing_email: 'customer@neetpeak.com',
        billing_phone: address.phone,
        shipping_is_billing: true,
        order_items: [{
          name: productTitle,
          sku: `PROD-${productId?.slice(0, 8) || 'UNKNOWN'}`,
          units: 1,
          selling_price: order.amount,
          discount: 0,
          tax: 0,
        }],
        payment_method: 'Prepaid',
        sub_total: order.amount,
        length: parseInt(dims[0]) || 25, 
        breadth: parseInt(dims[1]) || 20, 
        height: parseInt(dims[2]) || 3, 
        weight: weight,
      });

      // Update order with Shiprocket IDs
      await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiprocket_order_id: shiprocketOrder.order_id,
          shiprocket_shipment_id: shiprocketOrder.shipment_id,
          delivery_status: 'processing',
        }),
      });

      return res.json({ success: true, shiprocket_order_id: shiprocketOrder.order_id, shipment_id: shiprocketOrder.shipment_id });
    }

    // Get Couriers
    if (path.includes('/api/shiprocket/couriers') && method === 'POST') {
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
      return res.json(couriers);
    }

    // Ship Order (Generate AWB)
    if (path.includes('/api/shiprocket/ship') && method === 'POST') {
      const { orderId, courier_id } = req.body;
      const { url, key } = getSupabaseConfig();

      const orderRes = await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}&select=shiprocket_shipment_id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const orders = await orderRes.json();
      if (!orders?.[0]?.shiprocket_shipment_id) return res.status(400).json({ error: 'Shipment not created' });

      const shipment_id = orders[0].shiprocket_shipment_id;
      const awbResponse = await shiprocketApi('courier/assign/awb', 'POST', { shipment_id, courier_id });
      const pickupResponse = await shiprocketApi('courier/generate/pickup', 'POST', { shipment_id: [shipment_id] });

      await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: awbResponse.response?.data?.awb_code,
          delivery_status: 'shipped',
          shipped_at: new Date().toISOString(),
        }),
      });

      return res.json({ success: true, awb: awbResponse.response?.data?.awb_code, pickup: pickupResponse });
    }

    // Track Shipment
    if (path.includes('/api/shiprocket/track/') && method === 'GET') {
      const awb = path.split('/').pop();
      const tracking = await shiprocketApi(`courier/track/awb/${awb}`);
      return res.json(tracking);
    }

    // Cancel Shipment
    if (path.includes('/api/shiprocket/cancel') && method === 'POST') {
      const { orderId } = req.body;
      const { url, key } = getSupabaseConfig();

      const orderRes = await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}&select=shiprocket_order_id`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      });
      const orders = await orderRes.json();
      if (!orders?.[0]?.shiprocket_order_id) return res.status(400).json({ error: 'No Shiprocket order' });

      const cancelResponse = await shiprocketApi('orders/cancel', 'POST', { ids: [orders[0].shiprocket_order_id] });

      await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: 'cancelled' }),
      });

      return res.json({ success: true, response: cancelResponse });
    }

    // Update Order Status (Admin)
    if (path.match(/\/api\/orders\/[^/]+$/) && method === 'PATCH') {
      const orderId = path.split('/').pop();
      const { delivery_status, tracking_number, admin_notes } = req.body;
      const { url, key } = getSupabaseConfig();

      const updateData = { delivery_status, tracking_number, admin_notes, updated_at: new Date().toISOString() };
      if (delivery_status === 'shipped') updateData.shipped_at = new Date().toISOString();
      if (delivery_status === 'delivered') updateData.delivered_at = new Date().toISOString();

      const response = await fetch(`${url}/rest/v1/purchases?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(updateData),
      });
      return res.json(await response.json());
    }

    // ============ CART CHECKOUT ============

    // Create cart order
    if (path.includes('/api/create-cart-order') && method === 'POST') {
      const { items, amount, userId, guestEmail } = req.body;
      if (!items || items.length === 0 || !amount) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const rp = getRazorpay();
      if (!rp) return res.status(500).json({ error: 'Razorpay not configured' });
      
      const order = await rp.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `cart_${Date.now()}`,
        notes: { itemCount: items.length, userId: userId || 'guest', email: guestEmail || '' }
      });
      return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
    }

    // Verify cart payment
    if (path.includes('/api/verify-cart-payment') && method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, userId, guestEmail, amount, originalAmount, discountAmount, couponId, couponCode, hasPhysical, shippingAddress } = req.body;
      
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Verification failed' });
      }

      const { url, key } = getSupabaseConfig();

      // Create purchase for each item
      for (const item of items) {
        const purchaseData = {
          user_id: userId || null,
          guest_email: guestEmail || null,
          material_id: item.type === 'digital' ? item.id : null,
          product_id: item.type === 'hardcopy' ? item.id : null,
          product_type: item.type === 'digital' ? 'digital' : 'hardcopy',
          amount: item.price * item.quantity,
          original_amount: item.price * item.quantity,
          discount_amount: 0,
          coupon_id: couponId || null,
          coupon_code: couponCode || null,
          razorpay_order_id, razorpay_payment_id, razorpay_signature,
          status: 'completed',
          delivery_type: item.type === 'hardcopy' ? 'physical' : 'digital',
        };
        if (item.type === 'hardcopy' && shippingAddress) {
          purchaseData.shipping_address = shippingAddress;
          purchaseData.delivery_status = 'pending';
        }
        await fetch(`${url}/rest/v1/purchases`, {
          method: 'POST',
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(purchaseData),
        });
      }

      if (couponId && userId) {
        await fetch(`${url}/rest/v1/coupon_usage`, {
          method: 'POST',
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupon_id: couponId, user_id: userId, discount_applied: discountAmount || 0 }),
        });
      }

      return res.json({ success: true });
    }

    // Not found
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}