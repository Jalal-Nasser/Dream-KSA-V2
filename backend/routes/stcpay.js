const express = require('express');
const axios = require('axios');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const STC_BASE_URL = process.env.STC_BASE_URL; // TODO: set from docs
const STC_MERCHANT_ID = process.env.STC_MERCHANT_ID;
const STC_API_KEY = process.env.STC_API_KEY;
const STC_API_SECRET = process.env.STC_API_SECRET;
const STC_RETURN_URL = process.env.STC_RETURN_URL || 'https://api.dreamsksa.online/api/payments/stcpay/return';

/**
 * POST /api/payments/stcpay/create
 * Body: { user_id, amount_major, currency='SAR', coins_amount?, metadata? }
 * Creates an invoice/checkout session at STC and returns checkout_url.
 */
router.post('/create', async (req, res) => {
  try {
    const { user_id, amount_major, currency='SAR', coins_amount=null, metadata={} } = req.body;
    if (!user_id || !amount_major) return res.status(400).json({ error: 'missing user_id or amount_major' });

    const merchant_order_id = `stc_${Date.now()}`;
    const amountStr = Number(amount_major).toFixed(2);

    // TODO: Build request per STC docs (auth headers / signature)
    const payload = {
      // Example fields — REPLACE with actual STC schema:
      merchant_id: STC_MERCHANT_ID,
      amount: amountStr,
      currency,
      order_id: merchant_order_id,
      return_url: STC_RETURN_URL,
      // … any required customer or item fields …
    };

    // TODO: replace endpoint with real STC endpoint from docs
    const resp = await axios.post(`${STC_BASE_URL}/payments/create`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STC_API_KEY}`, // or whatever their auth scheme is
      },
      timeout: 20000,
    });

    const data = resp.data;
    const checkout_url = data.checkout_url || data.redirect_url; // adapt to real key

    // record pending payment
    const amountMinor = Math.round(Number(amount_major) * 100);
    await supabase.from('payments').insert({
      user_id,
      provider: 'stcpay',
      provider_payment_id: null,
      amount_bigint: amountMinor,
      currency,
      status: 'pending',
      metadata: { stc_create_resp: data, coins_amount, merchant_order_id, user_id, ...metadata }
    });

    return res.json({ ok: true, checkout_url, raw: data });
  } catch (err) {
    console.error('stcpay/create error', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

/**
 * POST /api/payments/stcpay/webhook
 * STC server-to-server notification. Verify signature (if provided), then finalize.
 */
router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = req.body;

    // TODO: verify signature using STC_WEBHOOK_SECRET if their webhooks are signed.

    // Extract reference & status from evt (adapt keys)
    const providerPaymentId = evt?.payment_reference || evt?.transaction_id;
    const success = evt?.status === 'PAID' || evt?.result === 'SUCCESS';

    // Find pending payment (match by provider_payment_id or merchant_order_id in metadata)
    let { data: rows } = await supabase
      .from('payments')
      .select('*')
      .or(`provider_payment_id.eq.${providerPaymentId},metadata->>merchant_order_id.eq.${evt?.order_id}`)
      .limit(1);

    let payment = rows?.[0] || null;

    if (success) {
      if (payment) {
        await supabase.from('payments').update({
          provider_payment_id: providerPaymentId,
          status: 'succeeded',
          updated_at: new Date().toISOString(),
          metadata: { ...payment.metadata, stc_webhook: evt }
        }).eq('id', payment.id);

        const user_id = payment.user_id || payment.metadata?.user_id;
        const coinsToCredit = payment.metadata?.coins_amount ? Number(payment.metadata.coins_amount) : 0;

        if (user_id) {
          await supabase.from('transactions').insert({
            user_id,
            type: 'purchase',
            amount_bigint: payment.amount_bigint,
            currency: payment.currency,
            related_payment_id: payment.id,
            metadata: { provider: 'stcpay', provider_payment_id: providerPaymentId, stc_webhook: evt }
          });
          if (coinsToCredit > 0) {
            await supabase.rpc('increment_profile_coins', { p_user_id: user_id, p_amount: Math.round(coinsToCredit) });
          }
        }
      }
      return res.json({ received: true });
    } else {
      if (payment) {
        await supabase.from('payments').update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          metadata: { ...payment.metadata, stc_webhook: evt }
        }).eq('id', payment.id);
      }
      return res.json({ received: true });
    }
  } catch (err) {
    console.error('stcpay/webhook error', err.message || err);
    return res.status(400).json({ error: 'bad webhook' });
  }
});

/**
 * GET /api/payments/stcpay/return
 * User browser redirect after payment; show simple page and let mobile app call a verify endpoint if needed.
 */
router.get('/return', (req, res) => {
  const { payment_reference, order_id, status } = req.query;
  res.send(`<html><body><h3>STC Pay return</h3>
    <p>status: ${status || ''}</p>
    <p>payment_reference: ${payment_reference || ''}</p>
    <p>order_id: ${order_id || ''}</p>
  </body></html>`);
});

module.exports = router;
