import { relations } from "drizzle-orm/relations";
import { users, authenticators, sessions, comments, votes, activityLogs, clientProfiles, subscriptions, subscriptionHistory, paymentAccounts, paymentProviders } from "./schema";

export const authenticatorsRelations = relations(authenticators, ({one}) => ({
	user: one(users, {
		fields: [authenticators.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	authenticators: many(authenticators),
	sessions: many(sessions),
	comments: many(comments),
	votes: many(votes),
	activityLogs: many(activityLogs),
	subscriptions: many(subscriptions),
	clientProfiles: many(clientProfiles),
	paymentAccounts: many(paymentAccounts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const votesRelations = relations(votes, ({one}) => ({
	user: one(users, {
		fields: [votes.userid],
		references: [users.id]
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
	clientProfile: one(clientProfiles, {
		fields: [activityLogs.clientId],
		references: [clientProfiles.id]
	}),
}));

export const clientProfilesRelations = relations(clientProfiles, ({one, many}) => ({
	activityLogs: many(activityLogs),
	user: one(users, {
		fields: [clientProfiles.userId],
		references: [users.id]
	}),
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({one}) => ({
	subscription: one(subscriptions, {
		fields: [subscriptionHistory.subscriptionId],
		references: [subscriptions.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	subscriptionHistories: many(subscriptionHistory),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const paymentAccountsRelations = relations(paymentAccounts, ({one}) => ({
	user: one(users, {
		fields: [paymentAccounts.userId],
		references: [users.id]
	}),
	paymentProvider: one(paymentProviders, {
		fields: [paymentAccounts.providerId],
		references: [paymentProviders.id]
	}),
}));

export const paymentProvidersRelations = relations(paymentProviders, ({many}) => ({
	paymentAccounts: many(paymentAccounts),
}));