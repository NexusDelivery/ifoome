# Security Summary

**Reviewed Files**: 22
**Issues Resolved**: 5

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| URL Sanitization | `src/utils/assetResolver.ts` | 50 | `resolveBundledAssetUrl` allowed arbitrary non-HTTP schemes (`javascript:`, `vbscript:`, non-image `data:` URIs) to pass through to image attributes. | Medium | Fixed | Blocked dangerous URI schemes and non-image `data:` URIs, returning an empty string fallback, and added matching form validation in `AdminMenu.tsx` and `AdminSettings.tsx`. |
| Privacy in Error Logs | `src/firebase.ts` | 42 | `handleFirestoreError` serialized signed-in user `email`, `userId`, and `providerInfo` emails into browser `console.error` output and thrown Error messages. | Medium | Fixed | Sanitized `handleFirestoreError` to log only error code/message, `operationType`, `path`, and a boolean `signedIn` flag. |
| AI Endpoint Input Limits | `server.ts` | 22 | `/api/ai/describe-dish` accepted up to `1mb` JSON payloads without bounding field lengths and returned raw HTTP status codes on unexpected failures. | Low | Fixed | Reduced JSON parser limit to `16kb`, enforced strict character limits (`name <= 120`, `ingredients <= 400`, `category <= 60`), and replaced raw status text in HTTP 500 responses with a generic user-friendly message. |
| Business & Schema Bounds | `src/components/public/CheckoutView.tsx` | 194 | Client validation allowed edge inputs (e.g., 1-character street/neighborhood, oversized `changeFor`, >99 quantity, >50 cart items) that conflicted with Firestore rules. | Medium | Fixed | Synchronized client validation, `maxLength` bounds, and `dataStore.createOrder` defensive checks with `firestore.rules`. |
| Storage & Rules Follow-Up | `storage.rules` | 11 | Storage writes allow any authenticated user (`request.auth != null`) because Storage security rules cannot query named Firestore databases for admin role verification. | Low | Needs Follow-Up | Documented the constraint transparently in `Privacidade.html` and `Testes.md`; keep Firebase Authentication account creation restricted and ensure `firestore.rules` / `storage.rules` are deployed in the Firebase Console. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| API Keys & Secrets | `server.ts` | `GEMINI_API_KEY` is read strictly server-side from `process.env` and never bundled into `dist/` or exposed to browser code. |
| Database Access Control | `firestore.rules` | Denies all access by default; blocks public reads/lists on `orders`, `admins`, and `adminSecurity`; requires `isAdmin()` for administrative writes and status transitions; enforces `getAfter()` store-open check on public order creation. |
| Security Rules Static Lint | `eslint.config.mjs` | `npx eslint firestore.rules` validates rules against `@firebase/eslint-plugin-security-rules` with zero findings. |
| Safe Rendering | `src/components/` | All React UI components use standard JSX text interpolation without `dangerouslySetInnerHTML`. |
| Customer Privacy & Consent | `Privacidade.html` | Explains personal data collected, purpose, role-based access, security safeguards, and browser-local storage controls via footer and checkout links. |

## PoC Verification

### Unsafe URL Scheme in Image Resolver
#### Summary
| Field | Value |
|---|---|
| Issue Type | Unsafe URI Scheme Handling |
| Impact | Medium |
| Affected File | `src/utils/assetResolver.ts:50` |
| Test Scenario | `javascript:alert(1)` or `data:text/html,<script>alert(1)</script>` supplied as a product image or restaurant logo URL. |

#### How It Was Fixed
Added explicit scheme validation at the entry of `resolveBundledAssetUrl` and inside `AdminMenu.tsx` / `AdminSettings.tsx` form handlers to reject `javascript:`, `vbscript:`, `file:`, and non-image `data:` URIs.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Input `javascript:alert(1)` is entered in `AdminMenu.tsx` (`dish-image`) or loaded from stored data into `DishImage.tsx` | Input enters validation / resolver |
| 2 | `AdminMenu.tsx:148` rejects `/^(javascript\|vbscript\|file):/i` before saving; if rendered directly, `assetResolver.ts:55` checks the same regex and `assetResolver.ts:59` rejects non-image `data:` URIs | Unsafe URL cleared to `''` |
| 3 | `DishImage.tsx:19` sees empty `resolvedSrc` and renders the safe placeholder icon card | **Handled Safely** |

#### Conclusion
**Fix Verified** — Dangerous URI schemes cannot be saved through admin forms or rendered into image `src` attributes.

### PII Leakage in Firestore Error Handling
#### Summary
| Field | Value |
|---|---|
| Issue Type | Sensitive Information in Client Error Logs |
| Impact | Medium |
| Affected File | `src/firebase.ts:42` |
| Test Scenario | A Firestore write fails while an administrator is signed in, triggering `handleFirestoreError(err, OperationType.UPDATE, 'orders/ord-1')`. |

#### How It Was Fixed
Removed `email`, `userId`, and `providerInfo` fields from the serialized error summary in `handleFirestoreError`, retaining only non-PII diagnostic fields (`error`, `operationType`, `path`, `signedIn`).

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | A failed Firestore operation calls `handleFirestoreError` in `src/firebase.ts:42` | Error handler invoked |
| 2 | `src/firebase.ts:54-59` builds `sanitizedSummary` with `{ error, operationType, path, signedIn }` without reading `currentUser.email` or `currentUser.uid` | PII stripped |
| 3 | `ErrorBoundary.tsx` / `dataStore.createOrder` maps the thrown error into a plain-language Portuguese message | **Handled Safely** |

#### Conclusion
**Fix Verified** — User emails and UIDs are no longer logged to browser console output or error payloads on Firestore failures.

### Oversized Payload on AI Endpoint
#### Summary
| Field | Value |
|---|---|
| Issue Type | Unbounded Input on Backend API Route |
| Impact | Low |
| Affected File | `server.ts:51` |
| Test Scenario | `POST /api/ai/describe-dish` with `{"name": "<130 chars>", "ingredients": "arroz"}`. |

#### How It Was Fixed
Lowered Express JSON body limit to `16kb` and added strict string length guards (`dishName <= 120`, `ingredients <= 400`, `category <= 60`) before invoking `@google/genai`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | HTTP POST reaches `/api/ai/describe-dish` at `server.ts:31` | Request parsed within `16kb` limit |
| 2 | `server.ts:51` checks `dishName.length > 120 \|\| ingredients.length > 400 \|\| category.length > 60` | Condition triggers |
| 3 | Server responds immediately with `HTTP 400` and does not call Gemini API | **Handled Safely** |

#### Conclusion
**Fix Verified** — Verified live against `http://localhost:3000/api/ai/describe-dish`, returning `HTTP 400` with a localized validation message.
