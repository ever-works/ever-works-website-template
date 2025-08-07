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
  username: text("username").unique(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  title: text("title"),
  avatar: text("avatar"),
  role_id: text("role_id").references(() => roles.id, { onDelete: "set null" }),
  status: text("status", { enum: ["active", "inactive"] }).default("active"),
  created_by: text("created_by").default("system"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
  isAdmin: boolean("is_admin").notNull().default(false),
});

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

export const accounts = pgTable(
	'accounts',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccountType>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => [
		{
			compoundKey: primaryKey({
				columns: [account.provider, account.providerAccountId]
			})
		}
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
    index("client_profile_user_id_idx").on(clientProfile.userId),
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

export const activityLogs = pgTable('activityLogs', {
	id: serial('id').primaryKey(),
	userId: text('userId').references(() => users.id),
	action: text('action').notNull(),
	timestamp: timestamp('timestamp').notNull().defaultNow(),
	ipAddress: varchar('ipAddress', { length: 45 })
});

export const passwordResetTokens = pgTable('passwordResetTokens', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull(),
	token: text('token').notNull().unique(),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull().unique(),
	isActive: boolean('is_active').notNull().default(true),
	subscribedAt: timestamp('subscribed_at').notNull().defaultNow(),
	unsubscribedAt: timestamp('unsubscribed_at'),
	lastEmailSent: timestamp('last_email_sent'),
	source: text('source').default('footer') // footer, popup, etc.
});

// ######################### Comment Schema #########################
export const comments = pgTable('comments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text('content').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
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
			.references(() => users.id, { onDelete: 'cascade' }),
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
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		planId: text('plan_id').notNull().default(PaymentPlan.FREE),
		status: text('status').notNull().default(SubscriptionStatus.PENDING),
		startDate: timestamp('start_date', { mode: 'date' }),
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
	'subscription_history',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		subscriptionId: text('subscription_id')
			.notNull()
			.references(() => subscriptions.id, { onDelete: 'cascade' }),
		action: text('action').notNull(),
		previousStatus: text('previous_status'),
		newStatus: text('new_status'),
		previousPlan: text('previous_plan'),
		newPlan: text('new_plan'),
		reason: text('reason'),
		metadata: text('metadata'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => ({
		subscriptionHistoryIndex: index('subscription_history_idx').on(table.subscriptionId),
		actionIndex: index('subscription_action_idx').on(table.action),
		createdAtIndex: index('subscription_history_created_at_idx').on(table.createdAt)
	})
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type CommentWithUser = Comment & { user: typeof users.$inferSelect };
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

// ######################### Subscription Types #########################
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type NewSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type SubscriptionWithUser = Subscription & {
	user: typeof users.$inferSelect;
};

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
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
export type ClientProfileWithUser = ClientProfile & {
  user: typeof users.$inferSelect;
};
