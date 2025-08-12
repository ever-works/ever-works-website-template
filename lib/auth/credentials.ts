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

      console.log('🔐 Auth Debug:', {
        email,
        isAdminSignin,
        credentialsIsAdmin: credentials.isAdmin,
        referer,
        hasPassword: !!password
      });

      // First, try to find user in users table (admin authentication)
      const foundUser = await getUserByEmail(email);
      
      console.log('👤 User Debug:', {
        foundUser: !!foundUser,
        hasPasswordHash: !!foundUser?.passwordHash
      });
      
      if (foundUser && foundUser.passwordHash) {
        // Check if this is a user with password in users table
        const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);
        
        console.log('🔑 Password Debug:', {
          isPasswordValid,
          isAdminSignin
        });
        
        if (isPasswordValid) {
          // Allow admin authentication for any user in users table
          if (isAdminSignin) {
            console.log('✅ Admin authentication successful');
            logActivity(foundUser.id, ActivityType.SIGN_IN);
            return foundUser;
          }
          
          // If user tries to sign in through client form, deny access
          if (!isAdminSignin) {
            console.log('❌ User trying to sign in through client form');
            throw new Error("Users must sign in through the admin portal.");
          }
        }
      }

      // If not found in users table or password doesn't match, try accounts table (client authentication)
      const clientAccount = await getClientAccountByEmail(email);
      
      console.log('👥 Client Account Debug:', {
        hasClientAccount: !!clientAccount
      });
      
      if (clientAccount) {
        const isClientPasswordValid = await verifyClientPassword(email, password);
        
        if (isClientPasswordValid) {
          // Get the user record for the client account
          const clientUser = await getUserByEmail(email);
          if (clientUser) {
            // Only allow client authentication if it's not an admin signin attempt
            if (!isAdminSignin) {
              console.log('✅ Client authentication successful');
              logActivity(clientUser.id, ActivityType.SIGN_IN);
              return clientUser;
            } else {
              console.log('❌ Client user trying to sign in through admin form');
              throw new Error("Client users cannot access admin portal.");
            }
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
