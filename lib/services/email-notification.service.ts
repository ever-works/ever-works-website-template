  import { AdminNotificationEmailHtml } from "@/lib/mail/templates/admin-notification";
import { getSubmissionDecisionTemplate } from "@/lib/mail/templates/submission-decision";
import { EmailService } from "@/lib/mail";

  export interface EmailNotificationData {
    to: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    notificationType: string;
    timestamp: string;
  }

  export class EmailNotificationService {
    /**
     * Send admin notification email
     */
    static async sendAdminNotification(data: EmailNotificationData) {
      try {
        // Create a simple email service instance for notifications
        const emailService = new EmailService({
          provider: process.env.EMAIL_PROVIDER || "resend",
          defaultFrom: process.env.EMAIL_FROM || "noreply@demo.ever.works",
          domain: process.env.NEXT_PUBLIC_APP_URL || 'https://demo.ever.works',
          apiKeys: {
            resend: process.env.RESEND_API_KEY || "",
            novu: process.env.NOVU_API_KEY || "",
          },
        });

        // Check if email service is available
        if (!emailService.isServiceAvailable()) {
          console.warn('[EmailNotification] Skipped - email service not configured');
          return {
            success: false,
            skipped: true,
            error: "Email service not configured",
          };
        }

        const template = AdminNotificationEmailHtml({
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          actionText: data.actionText,
          notificationType: data.notificationType,
          timestamp: data.timestamp,
        });

        const result = await emailService.sendCustomEmail({
          from: process.env.EMAIL_FROM || "noreply@demo.ever.works",
          to: data.to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        // If it's an availability error, return skipped result instead of failing
        if (error instanceof Error && error.message.includes('not available')) {
          console.warn('[EmailNotification] Skipped -', error.message);
          return {
            success: false,
            skipped: true,
            error: error.message,
          };
        }
        console.error("Error sending admin notification email:", error);
        return {
          success: false,
          error: "Failed to send email notification",
        };
      }
    }

    /**
     * Send item submission notification email
     */
    static async sendItemSubmissionEmail(
      adminEmail: string,
      itemName: string,
      submittedBy: string,
      actionUrl: string
    ) {
      return this.sendAdminNotification({
        to: adminEmail,
        title: "New Item Submission",
        message: `A new item "${itemName}" has been submitted by ${submittedBy} and requires review.`,
        actionUrl,
        actionText: "Review Item",
        notificationType: "item_submission",
        timestamp: new Date().toLocaleString(),
      });
    }

    /**
     * Send comment reported notification email
     */
    static async sendCommentReportedEmail(
      adminEmail: string,
      commentContent: string,
      reportedBy: string,
      actionUrl: string
    ) {
      return this.sendAdminNotification({
        to: adminEmail,
        title: "Comment Reported",
        message: `A comment has been reported by ${reportedBy} and requires review. Content: "${commentContent.substring(0, 100)}..."`,
        actionUrl,
        actionText: "Review Comment",
        notificationType: "comment_reported",
        timestamp: new Date().toLocaleString(),
      });
    }

    /**
     * Send user registration notification email
     */
    static async sendUserRegisteredEmail(
      adminEmail: string,
      userEmail: string,
      actionUrl: string
    ) {
      return this.sendAdminNotification({
        to: adminEmail,
        title: "New User Registration",
        message: `A new user has registered with email: ${userEmail}`,
        actionUrl,
        actionText: "View User",
        notificationType: "user_registered",
        timestamp: new Date().toLocaleString(),
      });
    }

    /**
     * Send payment failure notification email
     */
    static async sendPaymentFailedEmail(
      adminEmail: string,
      userEmail: string,
      amount: number,
      reason: string,
      actionUrl: string
    ) {
      return this.sendAdminNotification({
        to: adminEmail,
        title: "Payment Failure",
        message: `Payment failed for user ${userEmail} (${amount} USD). Reason: ${reason}`,
        actionUrl,
        actionText: "View User",
        notificationType: "payment_failed",
        timestamp: new Date().toLocaleString(),
      });
    }

    /**
     * Send system alert notification email
     */
    static async sendSystemAlertEmail(
      adminEmail: string,
      title: string,
      message: string,
      actionUrl?: string
    ) {
      return this.sendAdminNotification({
        to: adminEmail,
        title: `System Alert: ${title}`,
        message,
        actionUrl,
        actionText: actionUrl ? "View Details" : undefined,
        notificationType: "system_alert",
        timestamp: new Date().toLocaleString(),
      });
    }

    /**
     * Send bulk notifications to multiple admins
     */
    static async sendBulkAdminNotifications(
      adminEmails: string[],
      data: Omit<EmailNotificationData, "to">
    ) {
      const results = await Promise.allSettled(
        adminEmails.map(email =>
          this.sendAdminNotification({
            ...data,
            to: email,
          })
        )
      );

      const successful = results.filter(
        result => result.status === "fulfilled" && result.value.success
      ).length;

      const failed = results.length - successful;

      return {
        total: results.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          email: adminEmails[index],
          result: result.status === "fulfilled" ? result.value : { success: false, error: "Failed" },
        })),
      };
    }

    /**
     * Send submission decision notification email to user
     */
    static async sendSubmissionDecisionEmail(
      userEmail: string,
      itemName: string,
      status: "approved" | "rejected",
      reviewNotes?: string
    ) {
      try {
        const emailService = new EmailService({
          provider: process.env.EMAIL_PROVIDER || "resend",
          defaultFrom: process.env.EMAIL_FROM || "noreply@demo.ever.works",
          domain: process.env.NEXT_PUBLIC_APP_URL || "https://demo.ever.works",
          apiKeys: {
            resend: process.env.RESEND_API_KEY || "",
            novu: process.env.NOVU_API_KEY || "",
          },
        });

        if (!emailService.isServiceAvailable()) {
          console.warn("[EmailNotification] Skipped - email service not configured");
          return {
            success: false,
            skipped: true,
            error: "Email service not configured",
          };
        }

        const template = getSubmissionDecisionTemplate({
          itemName,
          status,
          reviewNotes,
        });

        const result = await emailService.sendCustomEmail({
          from: process.env.EMAIL_FROM || "noreply@demo.ever.works",
          to: userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes("not available")) {
          console.warn("[EmailNotification] Skipped -", error.message);
          return {
            success: false,
            skipped: true,
            error: error.message,
          };
        }
        console.error("Error sending submission decision email:", error);
        return {
          success: false,
          error: "Failed to send email notification",
        };
      }
    }
  }
