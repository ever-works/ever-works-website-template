import { pgTable, unique, text, timestamp, boolean, foreignKey, serial, varchar, integer, index, uniqueIndex } from "drizzle-orm/pg-core"



export const passwordResetTokens = pgTable("passwordResetTokens", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("passwordResetTokens_token_unique").on(table.token),
]);

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	isSubscribed: boolean("is_subscribed").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("newsletter_subscriptions_email_unique").on(table.email),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	passwordHash: text("password_hash"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	isAdmin: boolean("is_admin").default(false).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const verificationTokens = pgTable("verificationTokens", {
	identifier: text().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const activityLogs = pgTable("activityLogs", {
	id: serial().primaryKey().notNull(),
	userId: text(),
	action: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar({ length: 45 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activityLogs_userId_users_id_fk"
		}),
]);

export const authenticators = pgTable("authenticators", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "authenticators_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("authenticators_credentialID_unique").on(table.credentialId),
]);

export const sessions = pgTable("sessions", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const comments = pgTable("comments", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	rating: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	userId: text().notNull(),
	itemId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const votes = pgTable("votes", {
	id: text().primaryKey().notNull(),
	itemId: text("item_id").notNull(),
	voteType: text("vote_type").default('upvote').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userid: text().notNull(),
}, (table) => [
	index("item_votes_idx").using("btree", table.itemId.asc().nullsLast().op("text_ops")),
	uniqueIndex("unique_user_item_vote_idx").using("btree", table.userid.asc().nullsLast().op("text_ops"), table.itemId.asc().nullsLast().op("text_ops")),
	index("votes_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [users.id],
			name: "votes_userid_users_id_fk"
		}).onDelete("cascade"),
]);

export const accounts = pgTable("accounts", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
	displayName: text("display_name"),
	username: text().notNull(),
	bio: text(),
	jobTitle: text("job_title"),
	company: text(),
	industry: text(),
	phone: text(),
	website: text(),
	location: text(),
	accountType: text("account_type").default('individual'),
	status: text().default('active'),
	plan: text().default('free'),
	trialStartDate: timestamp("trial_start_date", { mode: 'string' }),
	trialEndDate: timestamp("trial_end_date", { mode: 'string' }),
	subscriptionStartDate: timestamp("subscription_start_date", { mode: 'string' }),
	subscriptionEndDate: timestamp("subscription_end_date", { mode: 'string' }),
	totalSubmissions: integer("total_submissions").default(0),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	lastActivityAt: timestamp("last_activity_at", { mode: 'string' }),
	timezone: text().default('UTC'),
	language: text().default('en'),
	emailNotifications: boolean("email_notifications").default(true),
	marketingEmails: boolean("marketing_emails").default(false),
	twoFactorEnabled: boolean("two_factor_enabled").default(false),
	emailVerified: boolean("email_verified").default(false),
	notes: text(),
	tags: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("account_plan_idx").using("btree", table.plan.asc().nullsLast().op("text_ops")),
	index("account_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("account_type_idx").using("btree", table.accountType.asc().nullsLast().op("text_ops")),
	index("account_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("accounts_username_unique").on(table.username),
]);

export const subscriptionHistory = pgTable("subscription_history", {
	id: text().primaryKey().notNull(),
	subscriptionId: text("subscription_id").notNull(),
	action: text().notNull(),
	previousStatus: text("previous_status"),
	newStatus: text("new_status"),
	previousPlan: text("previous_plan"),
	newPlan: text("new_plan"),
	reason: text(),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("subscription_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("subscription_history_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("subscription_history_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [subscriptions.id],
			name: "subscription_history_subscription_id_subscriptions_id_fk"
		}).onDelete("cascade"),
]);

export const subscriptions = pgTable("subscriptions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	status: text().notNull(),
	trialStart: timestamp("trial_start", { mode: 'string' }),
	trialEnd: timestamp("trial_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripePriceId: text("stripe_price_id"),
	stripeProductId: text("stripe_product_id"),
	plan: text().notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	canceledAt: timestamp("canceled_at", { mode: 'string' }),
	paymentMethodId: text("payment_method_id"),
	billingEmail: text("billing_email"),
	billingName: text("billing_name"),
	billingAddress: text("billing_address"),
	billingCity: text("billing_city"),
	billingState: text("billing_state"),
	billingPostalCode: text("billing_postal_code"),
	billingCountry: text("billing_country"),
}, (table) => [
	index("stripe_customer_idx").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	index("stripe_subscription_idx").using("btree", table.stripeSubscriptionId.asc().nullsLast().op("text_ops")),
	index("subscription_plan_idx").using("btree", table.plan.asc().nullsLast().op("text_ops")),
	index("subscription_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("user_subscription_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
