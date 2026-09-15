# SECURITY_RECON.md -- Abhartbrands Attack Surface Map
Generated: 2026-09-16 | Auditor: Red Team (AI)

---

## 1.1 Architecture Mapping

### Route Inventory

| Route | Type | Auth Required | Auth Method |
|-------|------|---------------|-------------|
| / | Public | No | -- |
| /pools | Public | No | -- |
| /pool/[id] | Public | No | -- |
| /auth/login | Public | No | -- |
| /auth/signup | Public | No | -- |
| /auth/forgot-password | Public | No | -- |
| /auth/callback | Public | No | -- |
| /dashboard | Protected | Yes | Middleware redirect to /auth/login |
| /dashboard/profile | Protected | Yes | Same |
| /dashboard/orders | Protected | Yes | Same |
| /checkout/[orderId] | Protected | Yes | Same |
| /admin | Protected | Double-guarded | Middleware + requireAdmin() in layout |
| /admin/products | Protected | Double-guarded | Same |
| /admin/pools | Protected | Double-guarded | Same |
| /admin/orders | Protected | Double-guarded | Same |
| /admin/qc | Protected | Double-guarded | Same |

### Trust Boundaries

Internet (Untrusted) -> [Next.js Middleware] (session refresh + redirect only, NO role check) -> [Server Component/Action] -> [Supabase RLS]

### Input Surfaces

| Surface | Location | Validated? |
|---------|----------|-----------|
| Login form | /auth/login | YES - Zod LoginSchema |
| Signup form | /auth/signup | YES - Zod SignupSchema |
| Forgot password | /auth/forgot-password | YES - Zod ResetPasswordSchema |
| Pool join | /pool/[id] -> joinPool() | PARTIAL - JoinPoolSchema exists but NOT called inside joinPool() |
| Profile update | /dashboard/profile | YES - Zod UpdateProfileSchema |
| Create product | /admin/products/new | YES - Zod CreateProductSchema |
| Create pool | /admin/pools/new | YES - Zod CreatePoolSchema |
| Update order status | Admin orders table | YES - Zod UpdateOrderStatusSchema |
| URL param orderId | /checkout/[orderId] | NO UUID format validation |
| URL param poolId | /pool/[id] | NO UUID format validation |

---

## 1.2 Auth Boundaries

### Middleware: protects /dashboard/*, /admin/*, /checkout/*
CRITICAL GAP: Middleware only checks session existence, NOT role. Buyer can attempt /admin/* -- second guard requireAdmin() in layout stops them.

### Admin Guard Coverage
- createProduct() - YES requireAdmin()
- createPool() - YES requireAdmin()
- deletePool() - YES requireAdmin()
- updatePoolStatus() - YES requireAdmin()
- updateOrderStatus() - YES requireAdmin()
- logQC() - YES requireAdmin()
- getPoolBuyers() - YES requireAdmin()

### UNGUARDED Admin Fetchers (NO auth check at all)
- getAdminStats() -- NO guard
- getAdminProducts() -- NO guard
- getAdminPools() -- NO guard
- getAdminOrders() -- NO guard (CRITICAL: returns ALL buyer PII)
- getAdminPool(poolId) -- NO guard

---

## 1.3 Supabase Configuration

### RLS Status

| Table | RLS | Public SELECT |
|-------|-----|---------------|
| profiles | YES | NO (own only or admin) |
| products | YES | YES (USING true) |
| pools | YES | YES (USING true) |
| pool_tiers | YES | YES (USING true) |
| pool_orders | YES | NO (own or admin) |
| qc_reports | YES | NO (own or admin) |

### Service Role Key
- NOT in .env.local (only ANON key present)
- NOT in any source file
- env.ts has optional() schema stub -- not actually used

---

## Attack Surface Summary

HIGH PRIORITY TARGETS:
1. getAdminOrders() -- No auth guard, all buyers PII returned
2. getAdminStats/Products/Pools/Pool() -- No auth guards
3. Rate limiter trusts x-forwarded-for -- spoofable header
4. In-memory rate limiter resets on serverless cold start -- bypassed on Vercel
5. joinPool() does NOT call JoinPoolSchema.safeParse() -- unused schema
6. Debug console.log statements in production server actions
7. Next.js 16.3.3 -- CVE check needed
