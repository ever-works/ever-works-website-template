# Ever Works Website Template

A modern, flexible website template with advanced payment flow management.

## 🚀 Features

### Payment Flow System

The template includes a sophisticated payment flow management system that allows users to choose between two payment modes:

#### 🔵 Pay Later (Default)
- **Submit first, pay after approval**
- No upfront cost
- Review before payment
- Risk-free submission
- Higher conversion rates

#### 🟣 Pay First
- **Pay upfront, publish immediately**
- Instant publication
- No review delays
- Guaranteed listing
- Priority placement

## 📁 Architecture

### Core Files

```
lib/
├── types/
│   └── payment.ts              # TypeScript types and enums
├── config/
│   └── payment-flows.ts        # Payment flow configurations
└── hooks/
    └── use-payment-flow.ts     # Custom React hook

components/
└── payment/
    ├── flow-selector.tsx       # Main flow selection component
    └── flow-indicator.tsx      # Compact flow indicator

app/[locale]/
└── payment-flow/
    └── page.tsx                # Demo page
```

### Key Components

#### `PaymentFlowSelector`
A comprehensive component for selecting payment flows with:
- Visual comparison cards
- Feature lists
- Benefit highlights
- Interactive selection

#### `PaymentFlowIndicator`
A compact component for displaying current flow with:
- Mode indicator
- Change button
- Compact/expanded modes

#### `usePaymentFlow` Hook
Custom hook providing:
- Flow state management
- Configuration access
- Step validation
- Status calculation

## 🛠 Usage

### Basic Implementation

```tsx
import { usePaymentFlow } from "@/hooks/use-payment-flow";
import { PaymentFlowSelector } from "@/components/payment/flow-selector";

function MyComponent() {
  const { selectedFlow, setSelectedFlow, isPayAtStart } = usePaymentFlow();

  return (
    <PaymentFlowSelector
      selectedFlow={selectedFlow}
      onFlowSelect={setSelectedFlow}
    />
  );
}
```

### Integration with Forms

```tsx
import { usePaymentFlow } from "@/hooks/use-payment-flow";

function SubmissionForm() {
  const { isPayAtStart, shouldShowPaymentStep } = usePaymentFlow();
  
  const steps = [
    { id: 1, title: "Product Details" },
    { id: 2, title: "Payment", show: isPayAtStart },
    { id: 3, title: "Review" }
  ].filter(step => step.show !== false);

  return (
    <form>
      {/* Your form content */}
      {shouldShowPaymentStep(currentStep, totalSteps) && (
        <PaymentStep />
      )}
    </form>
  );
}
```

## 🎨 Customization

### Adding New Payment Flows

1. **Update types** in `lib/types/payment.ts`:
```tsx
export enum PaymentFlow {
  PAY_AT_START = "pay_at_start",
  PAY_AT_END = "pay_at_end",
  PAY_INSTALLMENTS = "pay_installments" // New flow
}
```

2. **Add configuration** in `lib/config/payment-flows.ts`:
```tsx
export const PAYMENT_FLOWS: PaymentFlowConfig[] = [
  // ... existing flows
  {
    id: PaymentFlow.PAY_INSTALLMENTS,
    title: "Pay in Installments",
    subtitle: "Flexible Payment",
    // ... other config
  }
];
```

### Styling Customization

The components use Tailwind CSS classes and can be customized by:
- Modifying the configuration colors
- Overriding CSS classes
- Using the `className` prop for custom styling

## 🔧 Configuration

### Environment Variables

```env
# Payment configuration
NEXT_PUBLIC_DEFAULT_PAYMENT_FLOW=pay_at_end
NEXT_PUBLIC_ENABLE_PAYMENT_FLOW_SELECTION=true
```

### Feature Flags

```tsx
// Enable/disable features
const features = {
  paymentFlowSelection: process.env.NEXT_PUBLIC_ENABLE_PAYMENT_FLOW_SELECTION === 'true',
  payAtStart: true,
  payAtEnd: true
};
```

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎯 Best Practices

### Performance
- Use `useMemo` for expensive calculations
- Implement proper loading states
- Optimize bundle size with dynamic imports

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

### SEO
- Semantic HTML structure
- Meta tags for payment flows
- Structured data markup

## 🧪 Testing

### Demo Page
Visit `/payment-flow` to test the complete system.

### Unit Tests
```bash
npm run test:payment-flow
```

### Integration Tests
```bash
npm run test:integration
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Follow the commit message convention

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details
4. Contact the development team

