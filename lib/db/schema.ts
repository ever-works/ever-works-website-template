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
  index
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';
import { PaymentPlan, PaymentProvider } from '../constants';

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  createdAtIndex: index("users_created_at_idx").on(table.createdAt),
}));

export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "inactive"] }).default("active"),
  permissions: text("permissions").notNull(), // JSON string
  created_by: text("created_by").default("system"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusIndex: index("roles_status_idx").on(table.status),
  createdAtIndex: index("roles_created_at_idx").on(table.createdAt),
}));

// ######################### Permissions Schema #########################
export const permissions = pgTable("permissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  createdAtIndex: index("permissions_created_at_idx").on(table.createdAt),
}));

// ######################### Role Permissions Schema #########################
export const rolePermissions = pgTable("role_permissions", {
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  rolePermissionPk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  roleIndex: index("role_permissions_role_idx").on(table.roleId),
  permissionIndex: index("role_permissions_permission_idx").on(table.permissionId),
  createdAtIndex: index("role_permissions_created_at_idx").on(table.createdAt),
}));

// ######################### User Roles Schema #########################
export const userRoles = pgTable("user_roles", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userRolePk: primaryKey({ columns: [table.userId, table.roleId] }),
  userIndex: index("user_roles_user_idx").on(table.userId),
  roleIndex: index("user_roles_role_idx").on(table.roleId),
  createdAtIndex: index("user_roles_created_at_idx").on(table.createdAt),
}));

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // References users.id
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    // Client authentication fields
    email: text("email"),
    passwordHash: text("password_hash"),
    // OAuth fields
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
    index("accounts_email_idx").on(account.email),
    // Performance index for provider lookups
    index("accounts_provider_idx").on(account.provider),
  ]
);

// ######################### Client Profiles Schema #########################
export const clientProfiles = pgTable(
  "client_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    username: text("username").unique(),
    bio: text("bio"),
    jobTitle: text("job_title"),
    company: text("company"),
    industry: text("industry"),
    phone: text("phone"),
    website: text("website"),
    location: text("location"),
    avatar: text("avatar"),
    accountType: text("account_type", {
      enum: ["individual", "business", "enterprise"],
    }).default("individual"),
    status: text("status", {
      enum: ["active", "inactive", "suspended", "trial"],
    }).default("active"),
    plan: text("plan", {
      enum: ["free", "standard", "premium"],
    }).default("free"),
    timezone: text("timezone").default("UTC"),
    language: text("language").default("en"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    emailVerified: boolean("email_verified").default(false),
    totalSubmissions: integer("total_submissions").default(0),
    notes: text("notes"),
    tags: text("tags"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (clientProfile) => [
    uniqueIndex("client_profile_user_id_unique_idx").on(clientProfile.userId),
    index("client_profile_email_idx").on(clientProfile.email),
    index("client_profile_status_idx").on(clientProfile.status),
    index("client_profile_plan_idx").on(clientProfile.plan),
    index("client_profile_account_type_idx").on(clientProfile.accountType),
    index("client_profile_username_idx").on(clientProfile.username),
    index("client_profile_created_at_idx").on(clientProfile.createdAt),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    {
      compositePK: primaryKey({
        columns: [table.identifier, table.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
	'authenticators',
	{
		credentialID: text('credentialID').notNull().unique(),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		providerAccountId: text('providerAccountId').notNull(),
		credentialPublicKey: text('credentialPublicKey').notNull(),
		counter: integer('counter').notNull(),
		credentialDeviceType: text('credentialDeviceType').notNull(),
		credentialBackedUp: boolean('credentialBackedUp').notNull(),
		transports: text('transports')
	},
	(authenticator) => [
		{
			compositePK: primaryKey({
				columns: [authenticator.userId, authenticator.credentialID]
			})
		}
	]
);

export const activityLogs = pgTable("activityLogs", {
  id: serial("id").primaryKey(),
  userId: text("userId").references(() => clientProfiles.id, { onDelete: "cascade" }), // For client activities
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
}, (table) => [
  index("activity_logs_user_idx").on(table.userId),
  index("activity_logs_timestamp_idx").on(table.timestamp),
  index("activity_logs_action_idx").on(table.action)
]);

export const passwordResetTokens = pgTable('passwordResetTokens', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull(),
	token: text('token').notNull().unique(),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const newsletterSubscriptions = pgTable("newsletterSubscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  lastEmailSent: timestamp("last_email_sent"),
  source: text("source").default("footer"), // footer, popup, etc.
});

// ######################### Comment Schema #########################
export const comments = pgTable('comments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text('content').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => clientProfiles.id, { onDelete: 'cascade' }),
	itemId: text('itemId').notNull(),
	rating: integer('rating').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at')
});

export const VoteType = {
	UPVOTE: 'upvote',
	DOWNVOTE: 'downvote'
} as const;

export type VoteTypeValues = (typeof VoteType)[keyof typeof VoteType];

// ######################### Vote Schema #########################
export const votes = pgTable(
	'votes',
	{
		id: text('id')
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('userid')
			.notNull()
			.references(() => clientProfiles.id, { onDelete: 'cascade' }),
		itemId: text('item_id').notNull(),
		voteType: text('vote_type', { enum: [VoteType.UPVOTE, VoteType.DOWNVOTE] })
			.notNull()
			.default(VoteType.UPVOTE),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => ({
		uniqueUserItemVote: uniqueIndex('unique_user_item_vote_idx').on(table.userId, table.itemId),
		itemVotesIndex: index('item_votes_idx').on(table.itemId),
		createdAtIndex: index('votes_created_at_idx').on(table.createdAt)
	})
);

// ######################### Subscription Schema #########################
export const SubscriptionStatus = {
	ACTIVE: 'active',
	CANCELLED: 'cancelled',
	EXPIRED: 'expired',
	PENDING: 'pending',
	PAUSED: 'paused'
} as const;

export type SubscriptionStatusValues = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export type PaymentProviderValues = (typeof PaymentProvider)[keyof typeof PaymentProvider];

export type PlanTypeValues = (typeof PaymentPlan)[keyof typeof PaymentPlan];

export const subscriptions = pgTable(
	'subscriptions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		planId: text('plan_id').notNull().default(PaymentPlan.FREE),
		status: text('status').notNull().default(SubscriptionStatus.PENDING),
		startDate: timestamp('start_date', { mode: 'date' }).notNull().defaultNow(),
		endDate: timestamp('end_date', { mode: 'date' }),
		paymentProvider: text('payment_provider').default(PaymentProvider.STRIPE).notNull(),
		subscriptionId: text('subscription_id'),
		invoiceId: text('invoice_id'),
		amountDue: integer('amount_due').default(0),
		amountPaid: integer('amount_paid').default(0),
		priceId: text('price_id'),
		customerId: text('customer_id'),
		currency: text('currency').default('usd'),
		amount: integer('amount').default(0),
		interval: text('interval').default('month'),
		intervalCount: integer('interval_count').default(1),
		trialStart: timestamp('trial_start', { mode: 'date' }),
		trialEnd: timestamp('trial_end', { mode: 'date' }),
		cancelledAt: timestamp('cancelled_at', { mode: 'date' }),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
		cancelReason: text('cancel_reason'),
		hostedInvoiceUrl: text('hosted_invoice_url'),
		invoicePdf: text('invoice_pdf'),
		metadata: text('metadata'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(table) => ({
		userSubscriptionIndex: index('user_subscription_idx').on(table.userId),
		statusIndex: index('subscription_status_idx').on(table.status),
		providerSubscriptionIndex: uniqueIndex('provider_subscription_idx').on(
			table.paymentProvider,
			table.subscriptionId
		),
		planIndex: index('subscription_plan_idx').on(table.planId),
		createdAtIndex: index('subscription_created_at_idx').on(table.createdAt)
	})
);

// ######################### Subscription History Schema #########################
export const subscriptionHistory = pgTable(
  "subscriptionHistory",
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

  // ######################### Payment Provider Schema #########################
  export const paymentProviders = pgTable("paymentProviders", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique().default(PaymentProvider.STRIPE),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }, (table) => ({
    activeIndex: index("payment_provider_active_idx").on(table.isActive),
    createdAtIndex: index("payment_provider_created_at_idx").on(table.createdAt),
  }));
  
  // ######################### Payment Account Schema #########################
  export const paymentAccounts = pgTable("paymentAccounts", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("providerId")
      .notNull()
      .references(() => paymentProviders.id, { onDelete: "cascade" }),
    customerId: text("customerId").notNull(),
    accountId: text("accountId"),
    lastUsed: timestamp("lastUsed", { mode: "date" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }, (table) => ({
    userProviderIndex: uniqueIndex("user_provider_unique_idx").on(
      table.userId,
      table.providerId
    ),
    customerProviderIndex: uniqueIndex("customer_provider_unique_idx").on(
      table.customerId,
      table.providerId
    ),
    customerIdIndex: index("payment_account_customer_id_idx").on(table.customerId),
    providerIndex: index("payment_account_provider_idx").on(table.providerId),
    createdAtIndex: index("payment_account_created_at_idx").on(table.createdAt),
  }));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

// ######################### Permission Types #########################
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

// ######################### Subscription Types #########################
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type NewSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type SubscriptionWithUser = Subscription & {
	user: typeof users.$inferSelect;
};

export type OldPaymentProvider = typeof paymentProviders.$inferSelect;
export type NewPaymentProvider = typeof paymentProviders.$inferInsert;
export type PaymentAccount = typeof paymentAccounts.$inferSelect;
export type NewPaymentAccount = typeof paymentAccounts.$inferInsert;

export enum ActivityType {
	SIGN_UP = 'SIGN_UP',
	SIGN_IN = 'SIGN_IN',
	SIGN_OUT = 'SIGN_OUT',
	VERIFY_EMAIL = 'VERIFY_EMAIL',
	UPDATE_PASSWORD = 'UPDATE_PASSWORD',
	DELETE_ACCOUNT = 'DELETE_ACCOUNT',
	UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'
}

// ######################### Client Profile Types #########################
// ######################### Favorites Schema #########################
export const favorites = pgTable("favorites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemSlug: text("item_slug").notNull(),
  itemName: text("item_name").notNull(),
  itemIconUrl: text("item_icon_url"),
  itemCategory: text("item_category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userItemIndex: uniqueIndex("user_item_favorite_unique_idx").on(
    table.userId,
    table.itemSlug
  ),
  userIdIndex: index("favorites_user_id_idx").on(table.userId),
  itemSlugIndex: index("favorites_item_slug_idx").on(table.itemSlug),
  createdAtIndex: index("favorites_created_at_idx").on(table.createdAt),
}));

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
export type ClientProfileWithUser = ClientProfile & {
  user: typeof users.$inferSelect;
};

// ######################### Favorites Types #########################
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type FavoriteWithUser = Favorite & {
  user: typeof users.$inferSelect;
};
