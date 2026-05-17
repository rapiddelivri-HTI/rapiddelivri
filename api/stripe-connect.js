const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, accountId, email, name, type } = req.body;

  try {
    if (action === 'create_account') {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: { transfers: { requested: true } },
        business_type: type === 'restaurant' ? 'company' : 'individual',
        metadata: { role: type, name },
      });
      return res.status(200).json({ accountId: account.id });
    }

    if (action === 'onboarding_link') {
      const origin = req.headers.origin || 'https://rapiddelivri.com';
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/auth-system-FIXED.html?stripe=refresh`,
        return_url: `${origin}/auth-system-FIXED.html?stripe=success`,
        type: 'account_onboarding',
      });
      return res.status(200).json({ url: link.url });
    }

    if (action === 'check_status') {
      const account = await stripe.accounts.retrieve(accountId);
      return res.status(200).json({
        ready: account.details_submitted && account.charges_enabled,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
      });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    console.error('Stripe Connect error:', err);
    return res.status(500).json({ error: err.message });
  }
};
