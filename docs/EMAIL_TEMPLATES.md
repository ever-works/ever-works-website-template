# Professional Email Templates

This document explains how to use professional email templates for newsletters and communications.

## 📧 Available Templates

### 1. Welcome Email (`newsletter-welcome.ts`)
Template to welcome new newsletter subscribers.

**Function:** `getWelcomeEmailTemplate(email, appName)`

**Parameters:**
- `email` (string): Subscriber's email address
- `appName` (string, optional): Application name (default: "Ever Works")

**Usage example:**
```typescript
import { getWelcomeEmailTemplate } from '@/lib/mail/templates';

const template = getWelcomeEmailTemplate('user@example.com', 'My App');
await emailService.sendCustomEmail({
  from: 'welcome@myapp.com',
  to: 'user@example.com',
  subject: template.subject,
  html: template.html,
  text: template.text,
});
```

### 2. Unsubscribe Email (`newsletter-unsubscribe.ts`)
Template to confirm user unsubscription.

**Function:** `getUnsubscribeEmailTemplate(email, appName)`

**Parameters:**
- `email` (string): User's email address
- `appName` (string, optional): Application name

### 3. Regular Newsletter (`newsletter-regular.ts`)
Template for weekly/monthly newsletters with dynamic content.

**Function:** `getRegularNewsletterTemplate(email, appName, content)`

**Parameters:**
- `email` (string): Subscriber's email address
- `appName` (string, optional): Application name
- `content` (object): Newsletter content

**Content structure:**
```typescript
interface NewsletterContent {
  title: string;
  subtitle?: string;
  articles: Array<{
    title: string;
    excerpt: string;
    image?: string;
    link: string;
    category?: string;
  }>;
  featured?: {
    title: string;
    description: string;
    image?: string;
    link: string;
    cta: string;
  };
  stats?: {
    totalUsers: number;
    newFeatures: number;
    updates: number;
  };
}
```

## 🎨 Template Features

### Responsive Design
- Optimized for mobile and desktop
- Maximum width of 600px (email standard)
- Adaptive grid for statistics

### Modern Styles
- Colorful gradients for headers
- Rounded borders and shadows
- Subtle CSS animations
- Optimized typography

### Modular Sections
- **Header**: Logo and date
- **Main title**: Customizable title and subtitle
- **Featured section**: Main content (optional)
- **Articles**: News list
- **Statistics**: Weekly metrics (optional)
- **Footer**: Social links and unsubscribe

## 🚀 Usage Examples

### Sending a Regular Newsletter
```typescript
import { getRegularNewsletterTemplate } from '@/lib/mail/templates';

const content = {
  title: "🚀 New features",
  subtitle: "Discover the latest improvements",
  featured: {
    title: "✨ New interface",
    description: "Completely redesigned interface",
    link: "https://myapp.com/blog/new-ui",
    cta: "Discover"
  },
  articles: [
    {
      title: "📊 Enhanced statistics",
      excerpt: "New charts and metrics",
      category: "Feature",
      link: "https://myapp.com/blog/stats"
    }
  ],
  stats: {
    totalUsers: 15420,
    newFeatures: 8,
    updates: 12
  }
};

const template = getRegularNewsletterTemplate(email, "My App", content);
```

### Template Customization
```typescript
// Personalize content based on user
const personalizedContent = {
  ...newsletterContent,
  title: `Hello ${userName}, here are your updates!`
};

// Modify template colors
const customHtml = template.html.replace(
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)'
);
```

## 📱 Compatibility

### Supported Email Clients
- ✅ Gmail (Web and Mobile)
- ✅ Outlook (Web and Desktop)
- ✅ Apple Mail
- ✅ Thunderbird
- ✅ Yahoo Mail
- ✅ Native mobile clients

### Supported CSS Features
- ✅ Flexbox and Grid
- ✅ Gradients
- ✅ Rounded borders
- ✅ Shadows
- ✅ Media queries
- ✅ CSS animations

## 🔧 Configuration

### Environment Variables
```env
RESEND_API_KEY=your_resend_api_key
NOVU_API_KEY=your_novu_api_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Email Configuration
```typescript
const emailConfig = {
  provider: "resend", // or "novu"
  defaultFrom: "newsletter@yourdomain.com",
  domain: "https://yourdomain.com",
  apiKeys: {
    resend: process.env.RESEND_API_KEY,
    novu: process.env.NOVU_API_KEY,
  },
};
```

## 📊 Statistics and Tracking

### Recommended Metrics
- Open rate
- Click rate
- Unsubscribe rate
- Reading time
- Engagement by section

### Analytics Integration
```typescript
// Add UTM parameters for tracking
const trackingUrl = `${article.link}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`;
```

## 🎯 Best Practices

### Content
- Catchy and descriptive titles
- Short and impactful content
- Clear calls to action
- Optimized images (max 1MB)

### Technical
- Test on different email clients
- Verify links before sending
- Respect sending limits
- Monitor bounce rates

### Legal
- Always include unsubscribe link
- Comply with GDPR
- Get explicit consent
- Keep subscription proof

## 🐛 Troubleshooting

### Common Issues
1. **Images not displaying**: Use absolute URLs
2. **Styles not applied**: Inline CSS recommended
3. **Broken links**: Test all links before sending
4. **Spam**: Avoid trigger keywords

### Recommended Tests
- Test on different devices
- Check dark mode display
- Test with popular email clients
- Validate accessibility

## 📚 Resources

- [Email best practices guide](https://www.emailonacid.com/blog/)
- [Email CSS compatibility](https://www.campaignmonitor.com/css/)
- [Deliverability testing](https://www.mail-tester.com/) 