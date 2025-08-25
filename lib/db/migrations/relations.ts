import { relations } from "drizzle-orm/relations";
import { users, authenticators, sessions, comments, votes, activityLogs, clientProfiles, subscriptions, subscriptionHistory, accounts, paymentAccounts, paymentProviders, roles, rolePermissions, permissions, userRoles } from "./schema";

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
	accounts: many(accounts),
	subscriptions: many(subscriptions),
	clientProfiles: many(clientProfiles),
	paymentAccounts: many(paymentAccounts),
	userRoles: many(userRoles),
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

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
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

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
}));