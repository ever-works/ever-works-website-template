/**
 * Email template for successful payment confirmations
 * Used to notify users of successful payments
 */

interface PaymentSuccessData {
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  planName?: string;
  billingPeriod?: string;
  nextBillingDate?: string;
  receiptUrl?: string;
  companyName?: string;
  companyUrl?: string;
  supportEmail?: string;
}

export const getPaymentSuccessTemplate = (data: PaymentSuccessData) => {
  const {
    customerName,
    customerEmail,
    amount,
    currency,
    paymentMethod,
    transactionId,
    planName,
    billingPeriod,
    nextBillingDate,
    receiptUrl,
    companyName = "Ever Works",
    companyUrl = "https://ever.works",
    supportEmail = "support@ever.works"
  } = data;

  const currencySymbol = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency.toUpperCase();
  const isSubscription = planName && billingPeriod;

  const subject = isSubscription 
    ? `✅ Payment Confirmation - ${planName}`
    : `✅ Payment Confirmed - ${currencySymbol}${amount}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
        .success-icon {
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
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .payment-details h2 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 500;
          color: #6b7280;
        }
        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }
        .amount-highlight {
          color: #10b981;
          font-size: 20px;
          font-weight: 700;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        .subscription-info {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .subscription-info h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 16px;
        }
        .subscription-info p {
          margin: 5px 0;
          color: #3730a3;
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
          color: #10b981;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .security-notice {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .security-notice p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
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
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Payment Confirmed!</h1>
          <p>Thank you for your payment</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${customerName}</strong>,</p>
          
          <p>We have successfully received your payment. Here are the details of your transaction:</p>
          
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
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transactionId}</span>
            </div>
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
          
          ${isSubscription ? `
          <div class="subscription-info">
            <h3>🔄 Subscription Information</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Billing Period:</strong> ${billingPeriod}</p>
            ${nextBillingDate ? `<p><strong>Next Billing:</strong> ${nextBillingDate}</p>` : ''}
            <p>Your subscription is now active and you have access to all features of your plan.</p>
          </div>
          ` : ''}
          
          ${receiptUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${receiptUrl}" class="cta-button">📄 Download Receipt</a>
          </div>
          ` : ''}
          
          <div class="security-notice">
            <p><strong>🔒 Security:</strong> This transaction was secured by Stripe. Your payment information is protected by bank-level encryption.</p>
          </div>
          
          <p>If you have any questions about your payment, please don't hesitate to contact our support team.</p>
          
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
            This email was sent automatically following your payment.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Payment Confirmation - ${companyName}
    
    Hello ${customerName},
    
    We have successfully received your payment of ${currencySymbol}${amount}.
    
    Payment Details:
    - Amount: ${currencySymbol}${amount}
    - Payment Method: ${paymentMethod}
    - Transaction ID: ${transactionId}
    - Email: ${customerEmail}
    ${planName ? `- Plan: ${planName}` : ''}
    
    ${isSubscription ? `
    Subscription Information:
    - Plan: ${planName}
    - Billing Period: ${billingPeriod}
    ${nextBillingDate ? `- Next Billing: ${nextBillingDate}` : ''}
    
    Your subscription is now active.
    ` : ''}
    
    ${receiptUrl ? `Download Receipt: ${receiptUrl}` : ''}
    
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