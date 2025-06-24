export const getWelcomeEmailTemplate = (email: string, appName: string = "Ever Works") => {
  return {
    subject: `Bienvenue dans notre newsletter - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue dans notre newsletter</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .welcome-message {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .welcome-message h2 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 16px;
            font-weight: 600;
          }
          
          .welcome-message p {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.7;
            margin-bottom: 8px;
          }
          
          .features {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 30px;
            margin: 30px 0;
          }
          
          .features h3 {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            padding: 12px;
            background-color: white;
            border-radius: 6px;
            border-left: 4px solid #667eea;
          }
          
          .feature-icon {
            width: 24px;
            height: 24px;
            background-color: #667eea;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          }
          
          .feature-text {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
          
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px -3px rgba(102, 126, 234, 0.4);
          }
          
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          .social-links {
            margin-top: 20px;
          }
          
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .features {
              padding: 20px;
            }
            
            .footer {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue !</h1>
            <p>Vous êtes maintenant membre de notre communauté</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>Merci de vous être abonné !</h2>
              <p>Nous sommes ravis de vous compter parmi nos abonnés.</p>
              <p>Vous recevrez désormais nos dernières actualités, conseils exclusifs et offres spéciales directement dans votre boîte mail.</p>
            </div>
            
            <div class="features">
              <h3>Ce que vous allez recevoir :</h3>
              <div class="feature-item">
                <div class="feature-icon">📰</div>
                <div class="feature-text">Actualités et mises à jour de notre plateforme</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">💡</div>
                <div class="feature-text">Conseils et astuces pour optimiser votre expérience</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎁</div>
                <div class="feature-text">Offres exclusives et contenus premium</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🚀</div>
                <div class="feature-text">Nouvelles fonctionnalités en avant-première</div>
              </div>
            </div>
            
            <div class="cta-section">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ever.works'}" class="cta-button">
                Découvrir notre plateforme
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé à <strong>${email}</strong></p>
            <p>Si vous n'avez pas demandé cet abonnement, vous pouvez <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ever.works'}/newsletter/unsubscribe">vous désabonner ici</a></p>
            <p>© 2025 ${appName}. Tous droits réservés.</p>
            
            <div class="social-links">
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bienvenue dans notre newsletter !

Merci de vous être abonné à notre newsletter. Nous sommes ravis de vous compter parmi nos abonnés.

Ce que vous allez recevoir :
• Actualités et mises à jour de notre plateforme
• Conseils et astuces pour optimiser votre expérience  
• Offres exclusives et contenus premium
• Nouvelles fonctionnalités en avant-première

Découvrez notre plateforme : ${process.env.NEXT_PUBLIC_APP_URL || 'https://ever-works.com'}

Cet email a été envoyé à ${email}
Si vous n'avez pas demandé cet abonnement, vous pouvez vous désabonner ici : ${process.env.NEXT_PUBLIC_APP_URL || 'https://ever-works.com'}/newsletter/unsubscribe

© 2024 ${appName}. Tous droits réservés.
    `
  };
}; 
