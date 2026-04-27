const getStripe = () => require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const stripe = getStripe();
  const { amount, currency, patient_id, appointment_id } = req.body;
  if (!amount || !patient_id || !appointment_id) {
    return res.status(400).json({ error: 'amount, patient_id and appointment_id are required' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      metadata: {
        patient_id: String(patient_id),
        appointment_id: String(appointment_id)
      }
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  const stripe = getStripe();
  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      patient_id: pi.metadata.patient_id || null,
      appointment_id: pi.metadata.appointment_id || null,
      created_at: new Date(pi.created * 1000).toISOString()
    }));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
