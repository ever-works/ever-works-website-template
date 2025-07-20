# Stripe Configuration

This document describes how to configure Stripe in your application with a complete subscription system.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID=price_subscription_id_here
NEXT_PUBLIC_STRIPE_ONETIME_PRICE_ID=price_onetime_id_here
NEXT_PUBLIC_STRIPE_FREE_PRICE_ID=price_free_id_here

# Product Pricing
NEXT_PUBLIC_PRODUCT_PRICE_PRO=10.00
NEXT_PUBLIC_PRODUCT_PRICE_SPONSOR=20.00
NEXT_PUBLIC_PRODUCT_PRICE_FREE=0.00
```

## Stripe Dashboard Configuration

### 1. Create Products

In your Stripe dashboard, create the following products:

- **Free Plan**: 0.00 USD
- **Pro Plan**: 10.00 USD (monthly subscription)
- **Sponsor Plan**: 20.00 USD (one-time payment)

### 2. Configure Webhooks

Configure a webhook endpoint in your Stripe dashboard:

- URL: `https://your-domain.com/api/stripe/webhook`
- Events to listen for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3. Retrieve Keys

In your Stripe dashboard:

1. **Secret Key**: Developers → API keys → Secret key
2. **Public Key**: Developers → API keys → Publishable key
3. **Webhook Secret**: Developers → Webhooks → Select your webhook → Signing secret

## Payment System Structure

### Stripe Provider

The Stripe provider (`lib/payment/lib/providers/stripe-provider.ts`) implements:

- ✅ Customer management
- ✅ Payment intent creation
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Setup intent support
- ✅ Refunds

### API Routes

The following API routes are available:

- `POST /api/stripe/webhook` - Webhook handling
- `POST /api/stripe/subscription` - Subscription creation
- `PUT /api/stripe/subscription` - Subscription update
- `DELETE /api/stripe/subscription` - Subscription cancellation
- `POST /api/stripe/payment-intent` - Payment intent creation
- `GET /api/stripe/payment-intent` - Payment verification
- `POST /api/stripe/setup-intent` - Setup intent creation

### UI Components

The system uses Stripe Elements for payment forms:

- `StripeElementsWrapper` - Main wrapper
- `StripePaymentForm` - Payment form
- Support for Apple Pay and Google Pay

## Usage

### Create a Subscription

```typescript
const configs = createProviderConfigs({
  apiKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  options: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    apiVersion: '2023-10-16'
  }
});

const stripeProvider = new StripeProvider(configs.stripe);

const subscription = await stripeProvider.createSubscription({
  customerId: 'cus_customer_id',
  priceId: 'price_subscription_id',
  paymentMethodId: 'pm_payment_method_id',
  trialPeriodDays: 7
});
```

### Use the Payment Component

```tsx
import { PaymentForm } from '@/lib/payment';

function PaymentPage() {
  return (
    <PaymentForm
      amount={1000} // 10.00 USD in cents
      currency="usd"
      isSubscription={true}
      onSuccess={(paymentId) => {
        console.log('Payment succeeded:', paymentId);
      }}
      onError={(error) => {
        console.error('Payment error:', error);
      }}
    />
  );
}
```

## Error Handling

The system automatically handles:

- Stripe validation errors
- Payment failures
- Network issues
- Webhook errors

## Security

- All sensitive keys are in environment variables
- Webhook signature verification
- Server-side data validation
- User session management

## Testing

To test the integration:

1. Use Stripe test keys
2. Use Stripe test card numbers
3. Test webhooks with Stripe CLI
4. Check logs in Stripe dashboard

## Dependencies

The following packages are required:

```json
{
  "@stripe/react-stripe-js": "^3.7.0",
  "@stripe/stripe-js": "^7.3.0",
  "stripe": "^18.1.0"
}
```

## Support

For any questions or issues, refer to:

- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Integration Guide](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)
- [Subscription Management](https://stripe.com/docs/billing/subscriptions) 