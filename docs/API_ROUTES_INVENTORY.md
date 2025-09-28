# Complete API Routes Inventory

## 📊 Status Overview

**Total Routes**: 72  
**Currently Documented**: 15  
**Remaining**: 57

## 🎯 Documentation Progress by Category

### ✅ **COMPLETED (15 routes)**

#### Authentication (1/2)
- ✅ `GET /api/current-user` - Get current authenticated user

#### Favorites (2/2) 
- ✅ `GET /api/favorites` - List user favorites
- ✅ `DELETE /api/favorites/{itemSlug}` - Remove item from favorites

#### Featured Items (1/1)
- ✅ `GET /api/featured-items` - Get featured items

#### Admin - Categories (2/2)
- ✅ `GET /api/admin/categories` - List categories (Admin)
- ✅ `POST /api/admin/categories` - Create category (Admin)

#### Items & Content (2/8)
- ✅ `GET /api/items/{itemId}/comments` - Get item comments
- ✅ `POST /api/items/{itemId}/comments` - Create item comment
- ✅ `GET /api/items/{itemId}/votes` - Get item votes
- ✅ `POST /api/items/{itemId}/votes` - Vote on item
- ✅ `DELETE /api/items/{itemId}/votes` - Remove vote from item

#### Admin - Users (1/8)
- ✅ `GET /api/admin/users` - List users (Admin)

#### Admin - Items (1/4)
- ✅ `GET /api/admin/items` - List items (Admin)

#### Payments - Stripe (3/12)
- ✅ `GET /api/stripe/payment-methods/list` - List payment methods
- ✅ `POST /api/stripe/checkout` - Create checkout session
- ✅ `GET /api/stripe/subscriptions` - List user subscriptions

#### Utilities (2/3)
- ✅ `POST /api/verify-recaptcha` - Verify reCAPTCHA token
- ✅ `GET /api/version` - Get version information

---

### 🔄 **REMAINING TO DOCUMENT (57 routes)**

#### Authentication (1 remaining)
- ⏳ `POST /api/auth/change-password` - Change user password

#### Items & Content (6 remaining)
- ⏳ `GET /api/items/{itemId}/comments/{commentId}` - Get specific comment
- ⏳ `PATCH /api/items/{itemId}/comments/rating/{commentId}` - Update comment rating
- ⏳ `GET /api/items/{itemId}/votes/count` - Get vote count only
- ⏳ `GET /api/items/{itemId}/votes/status` - Get user vote status

#### Admin - Categories (3 remaining)
- ⏳ `GET /api/admin/categories/{id}` - Get category by ID
- ⏳ `PUT /api/admin/categories/{id}` - Update category
- ⏳ `DELETE /api/admin/categories/{id}` - Delete category
- ⏳ `GET /api/admin/categories/git` - Get Git repository status
- ⏳ `POST /api/admin/categories/reorder` - Reorder categories

#### Admin - Users (7 remaining)
- ⏳ `POST /api/admin/users` - Create user (Admin)
- ⏳ `GET /api/admin/users/{id}` - Get user by ID
- ⏳ `PUT /api/admin/users/{id}` - Update user
- ⏳ `DELETE /api/admin/users/{id}` - Delete user
- ⏳ `GET /api/admin/users/stats` - Get user statistics
- ⏳ `POST /api/admin/users/check-email` - Check email availability
- ⏳ `POST /api/admin/users/check-username` - Check username availability

#### Admin - Items (3 remaining)
- ⏳ `POST /api/admin/items` - Create item (Admin)
- ⏳ `GET /api/admin/items/{id}` - Get item by ID
- ⏳ `PUT /api/admin/items/{id}` - Update item
- ⏳ `DELETE /api/admin/items/{id}` - Delete item
- ⏳ `POST /api/admin/items/{id}/review` - Review item
- ⏳ `GET /api/admin/items/stats` - Get item statistics

#### Admin - Clients (6 remaining)
- ⏳ `GET /api/admin/clients` - List clients (Admin)
- ⏳ `POST /api/admin/clients` - Create client (Admin)
- ⏳ `GET /api/admin/clients/{clientId}` - Get client by ID
- ⏳ `PUT /api/admin/clients/{clientId}` - Update client
- ⏳ `DELETE /api/admin/clients/{clientId}` - Delete client
- ⏳ `POST /api/admin/clients/advanced-search` - Advanced client search
- ⏳ `POST /api/admin/clients/bulk` - Bulk client operations
- ⏳ `GET /api/admin/clients/dashboard` - Client dashboard stats
- ⏳ `GET /api/admin/clients/stats` - Client statistics

#### Admin - Featured Items (2 remaining)
- ⏳ `POST /api/admin/featured-items` - Create featured item (Admin)
- ⏳ `GET /api/admin/featured-items/{id}` - Get featured item by ID
- ⏳ `PUT /api/admin/featured-items/{id}` - Update featured item
- ⏳ `DELETE /api/admin/featured-items/{id}` - Delete featured item

#### Admin - Comments (2 remaining)
- ⏳ `GET /api/admin/comments` - List comments (Admin)
- ⏳ `GET /api/admin/comments/{id}` - Get comment by ID
- ⏳ `PUT /api/admin/comments/{id}` - Update comment
- ⏳ `DELETE /api/admin/comments/{id}` - Delete comment

#### Admin - Tags (2 remaining)
- ⏳ `GET /api/admin/tags` - List tags (Admin)
- ⏳ `POST /api/admin/tags` - Create tag (Admin)
- ⏳ `GET /api/admin/tags/{id}` - Get tag by ID
- ⏳ `PUT /api/admin/tags/{id}` - Update tag
- ⏳ `DELETE /api/admin/tags/{id}` - Delete tag

#### Admin - Roles (4 remaining)
- ⏳ `GET /api/admin/roles` - List roles (Admin)
- ⏳ `POST /api/admin/roles` - Create role (Admin)
- ⏳ `GET /api/admin/roles/{id}` - Get role by ID
- ⏳ `PUT /api/admin/roles/{id}` - Update role
- ⏳ `DELETE /api/admin/roles/{id}` - Delete role
- ⏳ `GET /api/admin/roles/active` - Get active roles
- ⏳ `GET /api/admin/roles/stats` - Get role statistics

#### Admin - Notifications (3 remaining)
- ⏳ `GET /api/admin/notifications` - List notifications (Admin)
- ⏳ `GET /api/admin/notifications/{id}` - Get notification by ID
- ⏳ `POST /api/admin/notifications/{id}/read` - Mark notification as read
- ⏳ `POST /api/admin/notifications/mark-all-read` - Mark all notifications as read

#### Admin - Dashboard (1 remaining)
- ⏳ `GET /api/admin/dashboard/stats` - Get dashboard statistics

#### Payments - Stripe (9 remaining)
- ⏳ `POST /api/stripe/payment-intent` - Create payment intent
- ⏳ `GET /api/stripe/payment-methods/{id}` - Get payment method by ID
- ⏳ `POST /api/stripe/payment-methods/create` - Create payment method
- ⏳ `PUT /api/stripe/payment-methods/update` - Update payment method
- ⏳ `DELETE /api/stripe/payment-methods/delete` - Delete payment method
- ⏳ `GET /api/stripe/setup-intent` - Create setup intent
- ⏳ `GET /api/stripe/setup-intent/{id}` - Get setup intent by ID
- ⏳ `POST /api/stripe/subscription` - Create subscription
- ⏳ `POST /api/stripe/subscription/{subscriptionId}/cancel` - Cancel subscription
- ⏳ `POST /api/stripe/subscription/{subscriptionId}/reactivate` - Reactivate subscription
- ⏳ `PUT /api/stripe/subscription/{subscriptionId}/update` - Update subscription
- ⏳ `POST /api/stripe/subscription/portal` - Create customer portal session
- ⏳ `POST /api/stripe/webhook` - Handle Stripe webhooks

#### Payments - LemonSqueezy (6 remaining)
- ⏳ `POST /api/lemonsqueezy/checkout` - Create LemonSqueezy checkout
- ⏳ `GET /api/lemonsqueezy/list` - List LemonSqueezy subscriptions
- ⏳ `POST /api/lemonsqueezy/cancel` - Cancel LemonSqueezy subscription
- ⏳ `POST /api/lemonsqueezy/reactivate` - Reactivate LemonSqueezy subscription
- ⏳ `PUT /api/lemonsqueezy/update` - Update LemonSqueezy subscription
- ⏳ `PUT /api/lemonsqueezy/update-plan` - Update LemonSqueezy plan

#### User Management (2 remaining)
- ⏳ `GET /api/user/payments` - Get user payment history
- ⏳ `GET /api/user/subscription` - Get user subscription details

#### Payment Accounts (2 remaining)
- ⏳ `GET /api/payment/account` - Get payment account info
- ⏳ `GET /api/payment/account/{userId}` - Get payment account by user ID

#### Version (1 remaining)
- ⏳ `POST /api/version/sync` - Trigger manual repository sync

---

## 🎯 Next Priority Routes to Document

### **High Priority (Core Functionality)**
1. `POST /api/auth/change-password` - Essential auth feature
2. `GET /api/admin/dashboard/stats` - Admin overview
3. `POST /api/stripe/subscription` - Core payment feature
4. `POST /api/lemonsqueezy/checkout` - Alternative payment
5. `GET /api/user/subscription` - User subscription status

### **Medium Priority (Admin Features)**
6. `POST /api/admin/items` - Item creation
7. `GET /api/admin/clients` - Client management
8. `GET /api/admin/comments` - Comment moderation
9. `POST /api/admin/featured-items` - Featured content management
10. `GET /api/admin/roles` - Role management

### **Lower Priority (Advanced Features)**
- Bulk operations
- Advanced search endpoints
- Statistics endpoints
- Webhook handlers

---

## 📝 Notes

- **Authentication**: Most admin routes require `isAdmin: true`
- **Pagination**: Most list endpoints support pagination parameters
- **Error Handling**: All routes follow consistent error response format
- **Validation**: Many routes use Zod schemas for request validation
- **Database**: All routes use Drizzle ORM with PostgreSQL

---

**Last Updated**: 2024-01-15  
**Documentation Coverage**: 21% (15/72 routes)
