import { compare, hash } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, logActivity, getClientAccountByEmail, verifyClientPassword } from "../db/queries";
import { ActivityType } from "../db/schema";

const SALT_ROUNDS = 10;

export enum AuthProviders {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  GITHUB = "github",
  TWITTER = "twitter",
  X = "x",
  MICROSOFT = "microsoft",
}

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string | null
) {
  if (!hashedPassword) {
    return false;
  }
  return compare(plainTextPassword, hashedPassword);
}

export const credentialsProvider = Credentials({
  name: AuthProviders.CREDENTIALS,
  credentials: {
    email: { type: "email" },
    password: { type: "password" },
    isAdmin: { type: "text" }, // Add flag to distinguish admin vs client signin
  },
  authorize: async (credentials, req) => {
    try {
      const email = credentials.email as string;
      const password = credentials.password as string;
      const referer = req?.headers?.get?.('referer') || '';
      const isAdminSignin = credentials.isAdmin === "true" || 
                           referer.includes("/admin/auth/signin");

      // First, try to find user in users table (admin authentication)
      const foundUser = await getUserByEmail(email);
      
      if (foundUser && foundUser.passwordHash) {
        // Check if this is an admin user with password in users table
        const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);
        
        if (isPasswordValid) {
          // Only allow admin authentication if it's an admin signin attempt
          if (isAdminSignin && foundUser.isAdmin) {
            logActivity(foundUser.id, ActivityType.SIGN_IN);
            return foundUser;
          }
          
          // If admin user tries to sign in through client form, deny access
          if (!isAdminSignin && foundUser.isAdmin) {
            throw new Error("Admin users must sign in through the admin portal.");
          }
        }
      }

      // If not found in users table or password doesn't match, try accounts table (client authentication)
      const clientAccount = await getClientAccountByEmail(email);
      
      if (clientAccount) {
        const isClientPasswordValid = await verifyClientPassword(email, password);
        
        if (isClientPasswordValid) {
          // Get the user record for the client account
          const clientUser = await getUserByEmail(email);
          if (clientUser) {
            // Only allow client authentication if it's not an admin signin attempt
            if (!isAdminSignin) {
              logActivity(clientUser.id, ActivityType.SIGN_IN);
              return clientUser;
            } else {
              throw new Error("Client users cannot access admin portal.");
            }
          }
        }
      }

      // If we get here, authentication failed
      throw new Error("Invalid email or password. Please try again.");
    } catch (error: any) {
      console.error("Authentication error:", error);
      throw new Error(error.message || "Invalid email or password. Please try again.");
    }
  },
});
