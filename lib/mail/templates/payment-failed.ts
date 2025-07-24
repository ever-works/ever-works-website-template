/**
 * Email template for payment failure notifications
 * Used to inform users about payment issues
 */

interface PaymentFailedData {
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  errorMessage: string;
  transactionId?: string;
  planName?: string;
  billingPeriod?: string;
  retryUrl?: string;
  updatePaymentUrl?: string;
  companyName?: string;
  companyUrl?: string;
  supportEmail?: string;
}

export const getPaymentFailedTemplate = (data: PaymentFailedData) => {
  const {
    customerName,
    customerEmail,
    amount,
    currency,
    paymentMethod,
    errorMessage,
    transactionId,
    planName,
    billingPeriod,
    retryUrl,
    updatePaymentUrl,
    companyName = "Ever Works",
    companyUrl = "https://ever.works",
    supportEmail = "support@ever.works"
  } = data;

  const currencySymbol = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency.toUpperCase();
  const isSubscription = planName && billingPeriod;

  const subject = isSubscription 
    ? `⚠️ Payment Failed - ${planName}`
    : `⚠️ Payment Issue - ${currencySymbol}${amount}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8fafc;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .warning-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 30px;
        }
        .content {
          padding: 30px;
        }
        .payment-details {
          background: #fef2f2;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #ef4444;
        }
        .payment-details h2 {
          margin: 0 0 15px 0;
          color: #991b1b;
          font-size: 18px;
          font-weight: 600;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #fecaca;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 500;
          color: #7f1d1d;
        }
        .detail-value {
          font-weight: 600;
          color: #991b1b;
        }
        .amount-highlight {
          color: #ef4444;
          font-size: 20px;
          font-weight: 700;
        }
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #991b1b;
          font-weight: 500;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 10px 10px 10px 0;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .cta-button.secondary {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }
        .cta-button.secondary:hover {
          box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
        }
        .action-buttons {
          text-align: center;
          margin: 30px 0;
        }
        .subscription-warning {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .subscription-warning h3 {
          margin: 0 0 10px 0;
          color: #92400e;
          font-size: 16px;
        }
        .subscription-warning p {
          margin: 5px 0;
          color: #92400e;
        }
        .solutions-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .solutions-section h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 16px;
        }
        .solutions-section ul {
          margin: 10px 0;
          padding-left: 20px;
          color: #1e40af;
        }
        .solutions-section li {
          margin: 8px 0;
        }
        .footer {
          background: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .footer a {
          color: #3b82f6;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .urgent-notice {
          background: #fef2f2;
          border: 2px solid #fecaca;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .urgent-notice p {
          margin: 0;
          color: #991b1b;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
            gap: 5px;
          }
          .detail-label {
            font-size: 14px;
          }
          .detail-value {
            font-size: 16px;
          }
          .cta-button {
            display: block;
            margin: 10px 0;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="warning-icon">⚠️</div>
          <h1>Payment Failed</h1>
          <p>We couldn't process your payment</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${customerName}</strong>,</p>
          
          <p>We encountered an issue while processing your payment. Here are the details:</p>
          
          <div class="payment-details">
            <h2>📋 Payment Details</h2>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value amount-highlight">${currencySymbol}${amount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>
            ${transactionId ? `
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transactionId}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${customerEmail}</span>
            </div>
            ${planName ? `
            <div class="detail-row">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">${planName}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="error-message">
            <strong>Failure Reason:</strong> ${errorMessage}
          </div>
          
          ${isSubscription ? `
          <div class="subscription-warning">
            <h3>⚠️ Warning - Subscription Affected</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Billing Period:</strong> ${billingPeriod}</p>
            <p>Your subscription may be suspended if payment is not resolved quickly.</p>
          </div>
          ` : ''}
          
          <div class="solutions-section">
            <h3>💡 Possible Solutions</h3>
            <ul>
              <li>Check that your card is not expired</li>
              <li>Ensure sufficient funds are available</li>
              <li>Contact your bank if necessary</li>
              <li>Update your payment information</li>
              <li>Try a different payment method</li>
            </ul>
          </div>
          
          <div class="action-buttons">
            ${retryUrl ? `
            <a href="${retryUrl}" class="cta-button">🔄 Retry Payment</a>
            ` : ''}
            ${updatePaymentUrl ? `
            <a href="${updatePaymentUrl}" class="cta-button secondary">💳 Update Payment</a>
            ` : ''}
          </div>
          
          ${isSubscription ? `
          <div class="urgent-notice">
            <p>📅 Please resolve this issue as soon as possible to avoid service interruption.</p>
          </div>
          ` : ''}
          
          <p>If you continue to experience issues or have questions, our support team is here to help.</p>
          
          <p>Best regards,<br>
          The ${companyName} Team</p>
        </div>
        
        <div class="footer">
          <p><strong>${companyName}</strong></p>
          <p>
            <a href="${companyUrl}">Website</a> | 
            <a href="mailto:${supportEmail}">Support</a> | 
            <a href="${companyUrl}/privacy">Privacy Policy</a>
          </p>
          <p style="margin-top: 20px;">
            © ${new Date().getFullYear()} ${companyName}. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            This email was sent automatically following a payment failure.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Payment Failed - ${companyName}
    
    Hello ${customerName},
    
    We encountered an issue while processing your payment of ${currencySymbol}${amount}.
    
    Payment Details:
    - Amount: ${currencySymbol}${amount}
    - Payment Method: ${paymentMethod}
    ${transactionId ? `- Transaction ID: ${transactionId}` : ''}
    - Email: ${customerEmail}
    ${planName ? `- Plan: ${planName}` : ''}
    
    Failure Reason: ${errorMessage}
    
    ${isSubscription ? `
    WARNING - Subscription Affected:
    - Plan: ${planName}
    - Billing Period: ${billingPeriod}
    
    Your subscription may be suspended if payment is not resolved quickly.
    ` : ''}
    
    Possible Solutions:
    - Check that your card is not expired
    - Ensure sufficient funds are available
    - Contact your bank if necessary
    - Update your payment information
    - Try a different payment method
    
    Actions:
    ${retryUrl ? `Retry Payment: ${retryUrl}` : ''}
    ${updatePaymentUrl ? `Update Payment: ${updatePaymentUrl}` : ''}
    
    If you have any questions, contact us at: ${supportEmail}
    
    Best regards,
    The ${companyName} Team
    
    ${companyUrl}
  `;

  return {
    subject,
    html,
    text
  };
}; 