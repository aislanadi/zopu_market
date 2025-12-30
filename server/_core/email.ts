/**
 * Email sending helper using built-in notification system
 * For now, uses notifyOwner as fallback until proper email service is configured
 */

import { notifyOwner } from "./notification";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification
 * TODO: Replace with proper email service (SendGrid, AWS SES, etc.)
 * For now, logs email content and notifies owner
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log("[Email] Sending email:", {
    to: options.to,
    subject: options.subject,
  });

  // Log email content for debugging
  console.log("[Email] Content:", options.html);

  // Notify owner about the email that should be sent
  const notificationSent = await notifyOwner({
    title: `Email para ${options.to}: ${options.subject}`,
    content: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML tags
  });

  return notificationSent;
}

/**
 * Email templates
 */

export function getPartnerApprovedEmailTemplate(data: {
  partnerName: string;
  companyName: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "🎉 Seu cadastro foi aprovado no ZOPUMarket!";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Parabéns, ${data.partnerName}!</h1>
        </div>
        <div class="content">
          <p>Seu cadastro como parceiro foi aprovado com sucesso!</p>
          
          <p><strong>Empresa:</strong> ${data.companyName}</p>
          
          <h3>Próximos passos:</h3>
          <ol>
            <li>Acesse o painel de parceiro usando o botão abaixo</li>
            <li>Complete seu perfil com logo e descrição</li>
            <li>Cadastre suas primeiras ofertas</li>
            <li>Configure a integração com Bitrix24 (opcional)</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="button">Acessar Painel de Parceiro</a>
          </div>
          
          <p>Estamos animados para ter você como parceiro do ZOPUMarket!</p>
          
          <p>Se tiver dúvidas, responda este email ou entre em contato com nossa equipe.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ZOPUMarket - Marketplace B2B de Soluções Empresariais</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Parabéns, ${data.partnerName}!

Seu cadastro como parceiro foi aprovado com sucesso!

Empresa: ${data.companyName}

Próximos passos:
1. Acesse o painel de parceiro: ${data.loginUrl}
2. Complete seu perfil com logo e descrição
3. Cadastre suas primeiras ofertas
4. Configure a integração com Bitrix24 (opcional)

Estamos animados para ter você como parceiro do ZOPUMarket!

Se tiver dúvidas, responda este email ou entre em contato com nossa equipe.
  `.trim();

  return { subject, html, text };
}

export function getPartnerRejectedEmailTemplate(data: {
  partnerName: string;
  companyName: string;
  reason?: string;
}): { subject: string; html: string; text: string } {
  const subject = "Atualização sobre seu cadastro no ZOPUMarket";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Atualização sobre seu cadastro</h1>
        </div>
        <div class="content">
          <p>Olá, ${data.partnerName},</p>
          
          <p>Agradecemos seu interesse em se tornar parceiro do ZOPUMarket.</p>
          
          <p>Após análise cuidadosa, identificamos que seu cadastro não atende aos critérios necessários neste momento.</p>
          
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ""}
          
          <p>Você pode:</p>
          <ul>
            <li>Revisar as informações e enviar um novo cadastro</li>
            <li>Entrar em contato conosco para mais detalhes</li>
          </ul>
          
          <p>Agradecemos sua compreensão.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ZOPUMarket - Marketplace B2B de Soluções Empresariais</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Olá, ${data.partnerName},

Agradecemos seu interesse em se tornar parceiro do ZOPUMarket.

Após análise cuidadosa, identificamos que seu cadastro não atende aos critérios necessários neste momento.

${data.reason ? `Motivo: ${data.reason}` : ""}

Você pode:
- Revisar as informações e enviar um novo cadastro
- Entrar em contato conosco para mais detalhes

Agradecemos sua compreensão.
  `.trim();

  return { subject, html, text };
}
