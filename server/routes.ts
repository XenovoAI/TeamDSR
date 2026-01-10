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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create Razorpay Order
  app.post('/api/create-order', async (req: Request, res: Response) => {
    try {
      const { amount, materialId, userId } = req.body;

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
        amount
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

        const purchaseData = {
          user_id: userId,
          material_id: materialId,
          amount: amount,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
        };

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

  return httpServer;
}
