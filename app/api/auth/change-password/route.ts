import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ratelimit } from "@/lib/utils/rate-limit";
import { sendPasswordChangeConfirmationEmail } from "@/lib/mail";

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Rate limiting: 5 attempts per 15 minutes per IP
const rateLimitConfig = {
  requests: 5,
  window: 15 * 60 * 1000, // 15 minutes
};

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") ||
                    request.headers.get("x-real-ip") ||
                    "unknown";

    console.log("Client IP:", clientIP);

    // Apply rate limiting
    const rateLimitResult = await ratelimit(
      `change-password:${clientIP}`,
      rateLimitConfig.requests,
      rateLimitConfig.window
    );

    if (!rateLimitResult.success) {
      console.log("Rate limit exceeded for IP:", clientIP);
      return NextResponse.json(
        {
          success: false,
          error: "Too many password change attempts. Please try again later.",
          retryAfter: rateLimitResult.retryAfter
        },
        { status: 429 }
      );
    }

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.issues);
    }

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: "Password change not available for OAuth accounts. Please contact support."
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await db
      .update(users)
      .set({
        passwordHash: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));

    // Send confirmation email
    try {
      const clientIP = request.headers.get("x-forwarded-for") ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      const emailData = {
        email: user.email || session.user.email!,
        userName: session.user.name || undefined,
        clientIP,
        userAgent
      };


      const emailResult = await sendPasswordChangeConfirmationEmail(
        emailData.email,
        emailData.userName,
        emailData.clientIP,
        emailData.userAgent
      );

      console.log("📧 Email result:", emailResult);
    } catch (emailError) {
      // Log email error but don't fail the password change
      console.error("Email error details:", {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
    }

    // Log security event (optional)
    console.log(`Password changed for user ${session.user.id} at ${new Date().toISOString()}`);

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Password change error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later."
      },
      { status: 500 }
    );
  }
}
