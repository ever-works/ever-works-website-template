import { Novu } from "@novu/node";
import { EmailMessage, EmailProvider } from ".";

export class NovuProvider implements EmailProvider {
  private novu: Novu;
  private defaultFrom: string;
  private templateId: string;

  constructor(apiKey: string, defaultFrom: string, templateId?: string) {
    this.novu = new Novu(apiKey);
    this.defaultFrom = defaultFrom;
    this.templateId = templateId || "email-default";
  }

  async sendEmail(message: EmailMessage): Promise<any> {
    const email = Array.isArray(message.to) ? message.to[0] : message.to;
    return this.novu.trigger(this.templateId, {
      to: {
        subscriberId: email,
        email: email,
      },
      payload: {
        subject: message.subject,
        body: message.html,
        preheader: message.text,
        from: message.from || this.defaultFrom,
      },
    });
  }

  getName(): string {
    return "novu";
  }
}
