# Security Specification — iFoome Delivery Firestore Rules

## 1. Data Invariants
1. **Default Deny:** Any path not explicitly matched is denied for both read and write.
2. **Restaurant Config Integrity:** Only an active verified administrator (`isAdmin()`) can create or update `/restaurants/default`. Public clients can only read `/restaurants/default` (`get`), never `list` or modify it.
3. **Product Availability & Integrity:** Only `isAdmin()` can create, update, or delete `/products/{productId}`. Unauthenticated public visitors can only `get` or `list` products where `available == true`, enforcing `RF-A07` at the database boundary.
4. **Order PII Isolation & Lifecycle Integrity:** Orders (`/orders/{orderId}`) contain customer PII (`customerName`, `customerPhone`, `address`). Public customers may `create` new orders only when `restaurants/default.isOpen == true`, with `status == 'Recebido'` and server timestamps (`request.time`). Only `isAdmin()` can `get`, `list`, or `update` orders. Terminal order states (`Concluído`, `Cancelado`) are locked against further status transitions, and `delete` is forbidden.
5. **Admin Password Gate Isolation:** `/adminSecurity/config` (storing `passwordHash`) is strictly unreadable by non-admins (`allow get: if isAdmin()`). Non-owner accounts can only register `/admins/{uid}` if Firestore rules verify `incoming().passwordHash == get(.../adminSecurity/config).data.passwordHash` and `incoming().version == get(.../adminSecurity/meta).data.version`. Changing the password increments `version` and invalidates prior sessions.

## 2. "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Product Write:** `POST /products/prod-hack` without `request.auth` -> DENIED.
2. **Public Scrape of Unavailable Products:** `list /products` without `where('available', '==', true)` by non-admin -> DENIED.
3. **Unauthenticated Order PII Read (`get`):** `get /orders/ord-1` without admin privileges -> DENIED.
4. **Unauthenticated Order PII Scrape (`list`):** `list /orders` by unauthenticated user or non-admin signed-in user -> DENIED.
5. **Fake Pre-Completed Order Creation:** `create /orders/ord-fake` with `status: 'Concluído'` instead of `'Recebido'` -> DENIED.
6. **Order Creation While Store Closed:** `create /orders/ord-closed` when `restaurants/default.isOpen == false` -> DENIED.
7. **Shadow Field / Ghost Property on Order:** `create /orders/ord-ghost` including `{ isAdmin: true }` or extra keys -> DENIED (`hasOnly` check).
8. **Terminal State Reversal:** `update /orders/ord-done` changing `status` from `'Concluído'` back to `'Em preparo'` -> DENIED.
9. **Financial Tampering on Order Update:** `update /orders/ord-1` attempting to modify `total` or `items` -> DENIED (`affectedKeys().hasOnly(['status', 'updatedAt'])`).
10. **Non-Admin Password Hash Read:** `get /adminSecurity/config` by a non-admin signed-in user -> DENIED.
11. **Wrong Password Admin Self-Promotion:** `create /admins/{uid}` with `role: 'admin'` and invalid `passwordHash` -> DENIED.
12. **ID Poisoning / Resource Exhaustion:** `create /orders/{1500_char_id}` or `name` exceeding `maxLength` -> DENIED (`isValidId` and `.size()` limits).
