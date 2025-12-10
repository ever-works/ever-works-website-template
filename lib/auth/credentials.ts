import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, logActivity, getClientAccountByEmail, verifyClientPassword, getClientProfileByUserId } from "../db/queries";
import { ActivityType } from "../db/schema";

const SALT_ROUNDS = 10;

// Dynamic import to avoid bundling bcryptjs in Edge Runtime
async function getBcrypt() {
  const bcryptjs = await import("bcryptjs");
  return bcryptjs;
}

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
  const { hash } = await getBcrypt();
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string | null
) {
  if (!hashedPassword) {
    return false;
  }
  const { compare } = await getBcrypt();
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

      const foundUser = await getUserByEmail(email);
      
      if (foundUser && foundUser.passwordHash) {
        
        const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

        if (isPasswordValid) {
          void logActivity(ActivityType.SIGN_IN, foundUser.id, 'user').catch(() => {});

          return {
            ...foundUser,
            isClient: false,
            isAdmin: true,
          };
        }
      }

      const clientAccount = await getClientAccountByEmail(email);
      
      if (clientAccount) {
        const isClientPasswordValid = await verifyClientPassword(email, password);
        
        if (isClientPasswordValid) {
          const clientProfile = await getClientProfileByUserId(clientAccount.userId);
          if (!clientProfile) {
            throw new Error("Invalid email or password. Please try again.");
          }
          const clientUser = {
            id: clientProfile.userId,
            clientProfileId: clientProfile.id,
            name: clientProfile.name || clientProfile.displayName,
            email: clientProfile.email,
            image: null,
            isClient: true,
            isAdmin: false,
          };
          void logActivity(ActivityType.SIGN_IN, clientProfile.id, 'client').catch(() => {});
          return clientUser;
        }
      }

      throw new Error("Invalid email or password. Please try again.");
    } catch (error: any) {
      console.error("Authentication error:", error);
      throw new Error(error.message || "Invalid email or password. Please try again.");
    }
  },
});
