import { compare, hash } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, logActivity, getClientAccountByEmail, verifyClientPassword, getClientProfileByEmail } from "../db/queries";
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
  },
  authorize: async (credentials) => {
    try {
      const email = credentials.email as string;
      const password = credentials.password as string;

      // First, try to find user in users table (admin authentication)
      const foundUser = await getUserByEmail(email);
      
      if (foundUser && foundUser.passwordHash) {
        // Check if this is a user with password in users table
        const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

        if (isPasswordValid) {
          // Allow authentication for any user in users table (admin)
          console.log('✅ Admin authentication successful');
          logActivity(ActivityType.SIGN_IN, foundUser.id);
          // Return admin user with consistent structure
          return {
            ...foundUser,
            isClient: false, // Explicitly mark as admin user
          };
        }
      }

      // If not found in users table or password doesn't match, try accounts table (client authentication)
      const clientAccount = await getClientAccountByEmail(email);
      
      if (clientAccount) {
        const isClientPasswordValid = await verifyClientPassword(email, password);
        
        if (isClientPasswordValid) {
          // Get the client profile for the account
          const clientProfile = await getClientProfileByEmail(email);
          if (clientProfile) {
            // Create a user-like object for the client
            const clientUser = {
              id: clientProfile.id,
              name: clientProfile.name || clientProfile.displayName,
              email: clientProfile.email,
              image: null,
              // Explicitly mark as non-admin
              isAdmin: false,
            };
            
            // Allow client authentication
            console.log('✅ Client authentication successful');
            logActivity(ActivityType.SIGN_IN, undefined, clientProfile.id);
            return clientUser;
          }
        }
      }

      // If we get here, authentication failed
      console.log('❌ Authentication failed - no valid credentials found');
      throw new Error("Invalid email or password. Please try again.");
    } catch (error: any) {
      console.error("Authentication error:", error);
      throw new Error(error.message || "Invalid email or password. Please try again.");
    }
  },
});
