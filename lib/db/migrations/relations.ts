import { relations } from "drizzle-orm/relations";
import { users, activityLogs, authenticators, sessions, comments, votes, subscriptions, subscriptionHistory } from "./schema";

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	activityLogs: many(activityLogs),
	authenticators: many(authenticators),
	sessions: many(sessions),
	comments: many(comments),
	votes: many(votes),
	subscriptions: many(subscriptions),
}));

export const authenticatorsRelations = relations(authenticators, ({one}) => ({
	user: one(users, {
		fields: [authenticators.userId],
		references: [users.id]
	}),
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