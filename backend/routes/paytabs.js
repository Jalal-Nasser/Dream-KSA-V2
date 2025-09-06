const express = require('express');
const axios = require('axios');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const PAYTABS_SECRET_KEY = process.env.PAYTABS_SECRET_KEY;
const PAYTABS_MERCHANT_EMAIL = process.env.PAYTABS_MERCHANT_EMAIL;
const PAYTABS_SITE_URL = process.env.PAYTABS_SITE_URL || 'https://api.dreamsksa.online';
const PAYTABS_RETURN_URL = process.env.PAYTABS_RETURN_URL || `${PAYTABS_SITE_URL}/api/payments/paytabs/verify-callback`;

if (!PAYTABS_SECRET_KEY || !PAYTABS_MERCHANT_EMAIL) {
  console.warn('WARNING: PayTabs env vars missing: PAYTABS_SECRET_KEY or PAYTABS_MERCHANT_EMAIL');
}

// Supabase server client (service role)
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. PayTabs routes will not work properly.');
  }
} catch (error) {
  console.warn('WARNING: Failed to create Supabase client:', error.message);
}

/**
 * POST /create
 * Body: { user_id, amount_major, currency, first_name, last_name, email, phone, product_title }
 * amount_major: number in major currency units (e.g., 10.50 SAR -> 10.50). We'll convert to minor (100*value) below for DB
 */
router.post('/create', async (req, res) => {
  try {
    const {
      user_id,
      amount_major,
      currency = 'SAR',
      first_name = 'User',
      last_name = '',
      email,
      phone,
      product_title = 'DreamsKSA Coins',
      coins_amount = null, // optional: how many coins this purchase grants
      metadata = {}
    } = req.body;

    if (!user_id || !amount_major || !email) {
      return res.status(400).json({ error: 'missing user_id, amount_major or email' });
    }

    // PayTabs expects amount as decimal string
    const amountStr = Number(amount_major).toFixed(2);

    // PayTabs create_pay_page endpoint
    const payload = {
      merchant_email: PAYTABS_MERCHANT_EMAIL,
      secret_key: PAYTABS_SECRET_KEY,
      site_url: PAYTABS_SITE_URL,
      return_url: PAYTABS_RETURN_URL,
      title: product_title,
      cc_first_name: first_name,
      cc_last_name: last_name || ' ',
      customer_email: email,
      customer_phone: phone || '',
      products_per_title: product_title,
      unit_price: amountStr,
      quantity: 1,
      amount: amountStr,
      currency: currency,
      other_charges: "0.00",
      merchant_order_id: `dreams_pay_${Date.now()}`,
      billing_address: "NA",
      billing_city: "NA",
      billing_country: "SA",
      shipping_first_name: first_name,
      shipping_last_name: last_name || " ",
      shipping_address: "NA",
      shipping_city: "NA",
      shipping_country: "SA",
      tokenize: "0",
      have_shipping: "0",
      // optional callback params
      // You may add custom merchant_params that PayTabs will return in callback
    };

    const resp = await axios.post('https://www.paytabs.com/apiv2/create_pay_page', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const data = resp.data;
    if (!data || !data.response_code) {
      return res.status(500).json({ error: 'unexpected paytabs response', raw: data });
    }

    // store pending payment row in DB (provider_payment_id unknown yet; use merchant_order_id as temp metadata)
    const amountMinor = Math.round(Number(amount_major) * 100); // SAR -> halalas
    const insert_payload = {
      user_id,
      provider: 'paytabs',
      provider_payment_id: null,
      amount_bigint: amountMinor,
      currency,
      status: 'pending',
      metadata: { paytabs_response: data, coins_amount, merchant_order_id: payload.merchant_order_id, ...metadata }
    };

    if (supabase) {
      await supabase.from('payments').insert(insert_payload);
    } else {
      console.warn('PayTabs create: Supabase not available, payment not stored in database');
    }

    // return checkout url
    return res.json({ ok: true, paypage: data && data.payment_url ? data.payment_url : null, raw: data });

  } catch (err) {
    console.error('paytabs/create error', err.response?.data || err.message || err);
    const msg = err.response?.data || err.message || String(err);
    return res.status(500).json({ error: msg });
  }
});

/**
 * POST /verify
 * Body: { payment_reference, merchant_order_id }
 * Use this for client-initiated verification after redirect
 */
router.post('/verify', async (req, res) => {
  try {
    const { payment_reference, merchant_order_id } = req.body;
    if (!payment_reference && !merchant_order_id) {
      return res.status(400).json({ error: 'missing payment_reference or merchant_order_id' });
    }

    // Call PayTabs verify payment API
    const verifyPayload = {
      merchant_email: PAYTABS_MERCHANT_EMAIL,
      secret_key: PAYTABS_SECRET_KEY,
      payment_reference: payment_reference || ''
    };

    const verifyResp = await axios.post('https://www.paytabs.com/apiv2/verify_payment', verifyPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const v = verifyResp.data;

    // v.response_code == '100' => success in many PayTabs docs; adjust if your gateway differs
    const isSuccess = v && (String(v.response_code) === '100' || String(v.response_code) === '4012' || String(v.response_code) === '4013');

    // Upsert payment row and create transaction/credit coins if succeeded
    const providerPaymentId = v.payment_reference || payment_reference || null;
    const amountStr = v && v.amount ? v.amount : null;
    const currency = v && v.currency ? v.currency : 'SAR';
    const amountMinor = amountStr ? Math.round(Number(amountStr) * 100) : null;

    // find existing pending payments by merchant_order_id OR provider_payment_id
    let existing = null;
    if (supabase) {
      let { data, error: exErr } = await supabase
        .from('payments')
        .select('*')
        .or(`metadata->>merchant_order_id.eq.${merchant_order_id},provider_payment_id.eq.${providerPaymentId}`)
        .limit(1);
      existing = data && data[0] ? data[0] : null;
    } else {
      console.warn('PayTabs verify: Supabase not available, cannot check existing payments');
    }

    // If already succeeded, return
    if (existing && existing.status === 'succeeded') {
      return res.json({ ok: true, message: 'already processed', payment: existing, verify: v });
    }

    // If success -> mark payment succeeded and create transaction and credit coins
    if (isSuccess) {
      if (supabase) {
        // Update or insert payment row
        if (existing) {
          await supabase.from('payments').update({
            provider_payment_id: providerPaymentId,
            status: 'succeeded',
            updated_at: new Date().toISOString(),
            metadata: { ...existing.metadata, paytabs_verify: v }
          }).eq('id', existing.id);
        } else {
          const insertPayload = {
            user_id: null, // unknown if not found; you may include mapping via merchant_order_id in metadata earlier
            provider: 'paytabs',
            provider_payment_id: providerPaymentId,
            amount_bigint: amountMinor || 0,
            currency,
            status: 'succeeded',
            metadata: { paytabs_verify: v, merchant_order_id }
          };
          const ins = await supabase.from('payments').insert(insertPayload).select().single();
          existing = ins.data;
        }
      } else {
        console.warn('PayTabs verify: Supabase not available, payment not stored in database');
      }

      // Now create a transaction and credit coins (if merchant stored coins_amount earlier in metadata)
      if (supabase) {
        // Try to get user_id from existing.payment or metadata
        const user_id = existing ? (existing.user_id || (existing.metadata && existing.metadata.user_id) || null) : null;
        const coinsToCredit = existing && existing.metadata && existing.metadata.coins_amount ? Number(existing.metadata.coins_amount) : null;

        // create transaction
        if (user_id) {
          await supabase.from('transactions').insert({
            user_id,
            type: 'purchase',
            amount_bigint: amountMinor || 0,
            currency,
            related_payment_id: existing ? existing.id : null,
            metadata: { provider: 'paytabs', provider_payment_id: providerPaymentId, paytabs_verify: v }
          });

          if (coinsToCredit) {
            // credit profiles.coins
            await supabase.rpc('increment_profile_coins', { p_user_id: user_id, p_amount: Math.round(Number(coinsToCredit)) })
              .catch(async rpcErr => {
                // fallback: update directly
                await supabase.from('profiles').update({
                  coins: supabase.raw('coins + ?', [Math.round(Number(coinsToCredit))])
                }).eq('id', user_id);
              });
          }
        } else {
          // no mapped user_id: you may want to save mapping from merchant_order_id -> user_id earlier
          console.warn('PayTabs verify: no user_id present to credit coins. merchant_order_id:', merchant_order_id);
        }
      }

      return res.json({ ok: true, success: true, verify: v, payment: existing });
    } else {
      // mark payment failed
      if (supabase && existing) {
        await supabase.from('payments').update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          metadata: { ...existing.metadata, paytabs_verify: v }
        }).eq('id', existing.id);
      }
      return res.json({ ok: false, message: 'payment not successful', verify: v });
    }
  } catch (err) {
    console.error('paytabs/verify error', err.response?.data || err.message || err);
    return res.status(500).json({ error: err.response?.data || err.message || String(err) });
  }
});

/**
 * GET /verify-callback
 * PayTabs may redirect the browser to return_url with params.
 * This endpoint can be used to show a friendly page and then instruct the client/mobile to call /verify with payment_reference.
 */
router.get('/verify-callback', async (req, res) => {
  // PayTabs commonly returns 'payment_reference' and 'merchant_order_id' as query params
  const { payment_reference, merchant_order_id } = req.query;
  // respond a small HTML page that tells the mobile/web client to call /verify (client should detect redirect url and call /verify)
  res.send(`
    <html>
      <body>
        <h3>Payment received — verifying...</h3>
        <script>
          // If used in in-app browser, you can post message to WebView or redirect to custom scheme:
          // Example: window.location = 'dream-ksa://payment-result?payment_reference=${payment_reference}&merchant_order_id=${merchant_order_id}'
          // For now show details:
          document.write('<p>payment_reference: ${payment_reference}</p>');
          document.write('<p>merchant_order_id: ${merchant_order_id}</p>');
        </script>
      </body>
    </html>
  `);
});

module.exports = router;