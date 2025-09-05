const express = require('express');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// PayTabs configuration
const PAYTABS_SECRET_KEY = process.env.PAYTABS_SECRET_KEY;
const PAYTABS_MERCHANT_EMAIL = process.env.PAYTABS_MERCHANT_EMAIL;
const PAYTABS_SITE_URL = process.env.PAYTABS_SITE_URL;
const PAYTABS_RETURN_URL = process.env.PAYTABS_RETURN_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// PayTabs API endpoints
const PAYTABS_API_URL = 'https://secure.paytabs.sa/payment/request';
const PAYTABS_VERIFY_URL = 'https://secure.paytabs.sa/payment/query';

// Helper function to generate PayTabs signature
function generatePayTabsSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join('&');
  return crypto.createHmac('sha256', PAYTABS_SECRET_KEY).update(signatureString).digest('hex');
}

// Create payment request
router.post('/create-payment', async (req, res) => {
  try {
    const { user_id, amount, currency = 'SAR', description = 'DreamKSA Coins' } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ error: 'user_id and amount are required' });
    }

    // Convert amount to halalas (SAR minor units)
    const amountInHalalas = Math.round(amount * 100);
    
    // Generate unique payment reference
    const payment_reference = `DKS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PayTabs payment request data
    const paymentData = {
      profile_id: PAYTABS_MERCHANT_EMAIL,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: payment_reference,
      cart_currency: currency,
      cart_amount: amountInHalalas,
      cart_description: description,
      paypage_lang: 'ar',
      customer_details: {
        name: 'DreamKSA User',
        email: 'user@dreamksa.com',
        phone: '966500000000',
        street1: 'Riyadh',
        city: 'Riyadh',
        state: 'Riyadh',
        country: 'SA',
        zip: '12345'
      },
      shipping_details: {
        name: 'DreamKSA User',
        email: 'user@dreamksa.com',
        phone: '966500000000',
        street1: 'Riyadh',
        city: 'Riyadh',
        state: 'Riyadh',
        country: 'SA',
        zip: '12345'
      },
      return: PAYTABS_RETURN_URL,
      callback: PAYTABS_RETURN_URL
    };

    // Generate signature
    paymentData.signature = generatePayTabsSignature(paymentData);

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        provider: 'paytabs',
        provider_payment_id: payment_reference,
        amount_bigint: amountInHalalas,
        currency,
        status: 'pending',
        metadata: {
          description,
          payment_reference
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return res.status(500).json({ error: 'Failed to create payment record' });
    }

    // Send request to PayTabs
    const paytabsResponse = await fetch(PAYTABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PAYTABS_SECRET_KEY
      },
      body: JSON.stringify(paymentData)
    });

    const paytabsData = await paytabsResponse.json();

    if (paytabsData.response_code === '4012') {
      // Success - return payment URL
      res.json({
        success: true,
        payment_id: payment.id,
        payment_url: paytabsData.redirect_url,
        payment_reference
      });
    } else {
      // PayTabs error
      console.error('PayTabs error:', paytabsData);
      res.status(400).json({
        error: 'Payment creation failed',
        details: paytabsData.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify payment callback
router.post('/verify-callback', async (req, res) => {
  try {
    const { payment_reference, response_code, result, transaction_id } = req.body;

    if (!payment_reference) {
      return res.status(400).json({ error: 'payment_reference is required' });
    }

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_payment_id', payment_reference)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify with PayTabs
    const verifyData = {
      profile_id: PAYTABS_MERCHANT_EMAIL,
      payment_reference: payment_reference
    };
    verifyData.signature = generatePayTabsSignature(verifyData);

    const verifyResponse = await fetch(PAYTABS_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PAYTABS_SECRET_KEY
      },
      body: JSON.stringify(verifyData)
    });

    const verifyResult = await verifyResponse.json();

    // Determine payment status
    const isSuccess = response_code === '100' || verifyResult.response_code === '100';
    const newStatus = isSuccess ? 'succeeded' : 'failed';

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        metadata: {
          ...payment.metadata,
          paytabs_response: verifyResult,
          transaction_id: transaction_id || verifyResult.transaction_id
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    // If payment succeeded, add coins to user's account
    if (isSuccess) {
      // Calculate coins (1 SAR = 10 coins, stored in minor units)
      const coinsToAdd = Math.round(payment.amount_bigint * 0.1); // 10 coins per SAR

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: payment.user_id,
          type: 'purchase',
          amount_bigint: coinsToAdd,
          currency: 'SAR',
          related_payment_id: payment.id,
          metadata: {
            description: 'Coins purchased via PayTabs',
            coins_added: coinsToAdd
          }
        });

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
      }

      // Update user's coin balance (if profiles table exists)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            coins: supabase.raw('coins + ?', [coinsToAdd])
          })
          .eq('id', payment.user_id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      } catch (profileError) {
        console.log('Profiles table not available, skipping coin update');
      }
    }

    res.json({
      success: true,
      status: newStatus,
      payment_id: payment.id
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment status
router.get('/status/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (error || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      payment_id: payment.id,
      status: payment.status,
      amount: payment.amount_bigint / 100, // Convert back to major units
      currency: payment.currency,
      created_at: payment.created_at
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
