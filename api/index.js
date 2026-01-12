import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Initialize Razorpay
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }
  return razorpay;
};

// Shiprocket token cache
let shiprocketToken = null;
let shiprocketTokenExpiry = 0;

const getShiprocketToken = async () => {
  if (shiprocketToken && Date.now() < shiprocketTokenExpiry) return shiprocketToken;
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error('Shiprocket credentials not configured');
  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Failed to authenticate with Shiprocket');
  const data = await response.json();
  shiprocketToken = data.token;
  shiprocketTokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
  return shiprocketToken;
};

const getSupabaseConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
});

// Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, materialId, userId } = req.body;
    if (!amount || !materialId || !userId) return res.status(400).json({ error: 'Missing fields' });
    const rp = getRazorpay();
    if (!rp) return res.status(500).json({ error: 'Razorpay not configured' });
    const order = await rp.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `material_${materialId}_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, materialId, userId, amount, originalAmount, discountAmount, couponId, couponCode, deliveryType, shippingAddress } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(body).digest('hex');
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: 'Verification failed' });
    
    const { url, key } = getSupabaseConfig();
    const purchaseData = {
      user_id: userId, material_id: materialId, amount, original_amount: originalAmount || amount,
      discount_amount: discountAmount || 0, coupon_id: couponId || null, coupon_code: couponCode || null,
      razorpay_order_id, razorpay_payment_id, razorpay_signature, status: 'completed',
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check Purchase
app.get('/api/check-purchase/:userId/:materialId', async (req, res) => {
  try {
    const { userId, materialId } = req.params;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/purchases?user_id=eq.${userId}&material_id=eq.${materialId}&status=eq.completed&select=id`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    const data = await response.json();
    res.json({ purchased: data && data.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Purchases
app.get('/api/purchases/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/purchases?user_id=eq.${userId}&status=eq.completed&select=*,material:study_materials(id,title,slug,file_url,thumbnail_url,material_type)&order=created_at.desc`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Validate Coupon
app.post('/api/coupons/validate', async (req, res) => {
  try {
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
    res.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discount_type: coupon.discount_type, discount_value: discountValue, max_discount_amount: coupon.max_discount_amount } });
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Validation failed' });
  }
});


// Admin Coupons
app.get('/api/admin/coupons', async (req, res) => {
  try {
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/coupons?select=*&order=created_at.desc`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/coupons', async (req, res) => {
  try {
    const data = req.body;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/coupons`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ code: data.code?.toUpperCase(), description: data.description, discount_type: data.discount_type, default_discount_value: data.default_discount_value, is_active: data.is_active ?? true, start_date: data.start_date, end_date: data.end_date, usage_limit: data.usage_limit, min_purchase_amount: data.min_purchase_amount, max_discount_amount: data.max_discount_amount }),
    });
    const result = await response.json();
    res.json(result[0] || result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/coupons?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ ...data, code: data.code?.toUpperCase(), updated_at: new Date().toISOString() }),
    });
    const result = await response.json();
    res.json(result[0] || result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, key } = getSupabaseConfig();
    await fetch(`${url}/rest/v1/coupons?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/coupons/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/coupon_products?coupon_id=eq.${id}&select=*,material:study_materials(id,title)`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/coupons/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { material_id, discount_value, applies_to } = req.body;
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/coupon_products`, {
      method: 'POST',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ coupon_id: id, material_id, discount_value, applies_to: applies_to || 'both' }),
    });
    const result = await response.json();
    res.json(result[0] || result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/coupon-products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, key } = getSupabaseConfig();
    await fetch(`${url}/rest/v1/coupon_products?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;