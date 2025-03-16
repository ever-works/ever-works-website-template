import { compare, hash } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, logActivity } from "../db/queries";
import { ActivityType } from "../db/schema";

const SALT_ROUNDS = 10;

export enum AuthProviders {
  CREDENTIALS = "credentials",
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
      const foundUser = await getUserByEmail(credentials.email as string);

      const isPasswordValid = await comparePasswords(
        credentials.password as string,
        foundUser.passwordHash
      );

      if (!isPasswordValid) {
        // to rethrow the error from the catch block
        throw new Error();
      }

      logActivity(foundUser.id, ActivityType.SIGN_IN);

      return foundUser;
    } catch (error: any) {
      console.error(error);
      throw new Error("Invalid email or password. Please try again.");
    }
  },
});
