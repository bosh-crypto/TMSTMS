//Blue Print Not the Real Code 
// Needs Further Tweaking and Testing
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const mqtt = require('mqtt');

const app = express();
const endpointSecret = 'YOUR_STRIPE_WEBHOOK_SECRET';

// 1. Establish connection to your EMQX Broker
const emqxClient = mqtt.connect('mqtt://your-emqx-broker-ip:1883', {
  clientId: 'node_backend_bridge',
  username: 'your_emqx_user', // If ACL/Auth is enabled
  password: 'your_emqx_password'
});

emqxClient.on('connect', () => {
  console.log('Successfully connected to EMQX!');
});

// 2. Stripe Webhook Endpoint
// Stripe requires the raw body to verify the signature, so we use express.raw
app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3. Handle specific Stripe events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Pro-tip: Pass the hardware's Device ID in the Stripe payment intent metadata 
    // when you create the c heckout session, so you know exactly which box to ping.
    const deviceId = paymentIntent.metadata.device_id || 'default_device';
    const amount = paymentIntent.amount / 100; // Stripe amounts are in cents
    
    const topic = `soundbox/${deviceId}/notify`;
    
    // Construct the payload the PCB will parse
    const payload = JSON.stringify({
       event: 'payment_success',
       amount: amount,
       currency: paymentIntent.currency
    });

    // 4. Publish to EMQX
    // Using QoS 1 ensures the message is delivered at least once to the broker
    emqxClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to publish to EMQX:', err);
      } else {
        console.log(`Payment notification pushed to EMQX on topic: ${topic}`);
      }
    });
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// app.listen(3000, () => console.log('Stripe-EMQX Bridge running on port 3000'));