import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  varchar,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { PaymentPlan, PaymentProvider } from "../constants";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    
    // Client Management Fields
    displayName: text("display_name"),
    username: text("username").unique(),
    bio: text("bio"),
    jobTitle: text("job_title"),
    company: text("company"),
    industry: text("industry"),
    phone: text("phone"),
    website: text("website"),
    location: text("location"),
    accountType: text("account_type", { 
      enum: ["individual", "team", "enterprise"] 
    }).default("individual"),
    status: text("status", { 
      enum: ["active", "inactive", "suspended", "trial", "cancelled"] 
    }).default("active"),
    plan: text("plan", { 
      enum: ["free", "standard", "premium"] 
    }).default("free"),
    trialStartDate: timestamp("trial_start_date", { mode: "date" }),
    trialEndDate: timestamp("trial_end_date", { mode: "date" }),
    subscriptionStartDate: timestamp("subscription_start_date", { mode: "date" }),
    subscriptionEndDate: timestamp("subscription_end_date", { mode: "date" }),
    totalSubmissions: integer("total_submissions").default(0),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
    lastActivityAt: timestamp("last_activity_at", { mode: "date" }),
    timezone: text("timezone").default("UTC"),
    language: text("language").default("en"),
    emailNotifications: boolean("email_notifications").default(true),
    marketingEmails: boolean("marketing_emails").default(false),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    emailVerified: boolean("email_verified").default(false),
    notes: text("notes"),
    tags: text("tags"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
    index("account_status_idx").on(account.status),
    index("account_plan_idx").on(account.plan),
    index("account_type_idx").on(account.accountType),
    index("account_username_idx").on(account.username),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationTokens", {
  identifier: text("identifier").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const activityLogs = pgTable("activityLogs", {
  id: serial("id").primaryKey(),
  userId: text("userId").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ipAddress", { length: 45 }),
});

export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isSubscribed: boolean("is_subscribed").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ######################### Comment Schema #########################
export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: text("itemId").notNull(),
  rating: integer("rating").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const VoteType = {
  UPVOTE: "upvote",
  DOWNVOTE: "downvote",
} as const;

export type VoteTypeValues = (typeof VoteType)[keyof typeof VoteType];

// ######################### Vote Schema #########################
export const votes = pgTable(
  "votes",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userid")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    voteType: text("vote_type", { enum: [VoteType.UPVOTE, VoteType.DOWNVOTE] })
      .notNull()
      .default(VoteType.UPVOTE),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserItemVote: uniqueIndex("unique_user_item_vote_idx").on(
      table.userId,
      table.itemId
    ),
    itemVotesIndex: index("item_votes_idx").on(table.itemId),
    createdAtIndex: index("votes_created_at_idx").on(table.createdAt),
  })
);

// ######################### Subscription Schema #########################
export const SubscriptionStatus = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  PENDING: "pending",
  PAUSED: "paused",
} as const;

export type SubscriptionStatusValues =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];


export type PaymentProviderValues =
  (typeof PaymentProvider)[keyof typeof PaymentProvider];


export type PlanTypeValues = (typeof PaymentPlan)[keyof typeof PaymentPlan];

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
    status: text("status", {
      enum: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"],
    }).notNull(),
    plan: text("plan", {
      enum: ["free", "standard", "premium"],
    }).notNull(),
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { mode: "date" }),
    trialStart: timestamp("trial_start", { mode: "date" }),
    trialEnd: timestamp("trial_end", { mode: "date" }),
    paymentMethodId: text("payment_method_id"),
    billingEmail: text("billing_email"),
    billingName: text("billing_name"),
    billingAddress: text("billing_address"),
    billingCity: text("billing_city"),
    billingState: text("billing_state"),
    billingPostalCode: text("billing_postal_code"),
    billingCountry: text("billing_country"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }, (table) => ({
    userSubscriptionIndex: index("user_subscription_idx").on(table.userId),
    statusIndex: index("subscription_status_idx").on(table.status),
    planIndex: index("subscription_plan_idx").on(table.plan),
    stripeCustomerIndex: index("stripe_customer_idx").on(table.stripeCustomerId),
    stripeSubscriptionIndex: index("stripe_subscription_idx").on(table.stripeSubscriptionId),
  })
);

// ######################### Subscription History Schema #########################
export const subscriptionHistory = pgTable(
  "subscription_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    previousStatus: text("previous_status"),
    newStatus: text("new_status"),
    previousPlan: text("previous_plan"),
    newPlan: text("new_plan"),
    reason: text("reason"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    subscriptionHistoryIndex: index("subscription_history_idx").on(
      table.subscriptionId
    ),
    actionIndex: index("subscription_action_idx").on(table.action),
    createdAtIndex: index("subscription_history_created_at_idx").on(
      table.createdAt
    ),
  })
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type CommentWithUser = Comment & { user: typeof users.$inferSelect };
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type NewsletterSubscription =
  typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription =
  typeof newsletterSubscriptions.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ######################### Subscription Types #########################
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type NewSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type SubscriptionWithUser = Subscription & {
  user: typeof users.$inferSelect;
};

// Client Types
export type Client = typeof accounts.$inferSelect;
export type NewClient = typeof accounts.$inferInsert;
export type ClientWithUser = Client & {
  user: typeof users.$inferSelect;
};

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
}
