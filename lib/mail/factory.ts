import { EmailProvider, EmailServiceConfig } from ".";
import { MockEmailProvider } from "./mock";
import { NovuProvider } from "./novu";
import { ResendProvider } from "./resend";

export class EmailProviderFactory {
  static createProvider(config: EmailServiceConfig): EmailProvider {
    switch (config.provider.toLowerCase()) {
      case "resend":
        return new ResendProvider(config.apiKeys.resend, config.defaultFrom);
      case "novu":
        return new NovuProvider(config.apiKeys.novu, config.defaultFrom);
      default:
        return new MockEmailProvider();
    }
  }
}
