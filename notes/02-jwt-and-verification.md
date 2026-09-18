# 02 — JWT and Verification

## Why JWT?
The browser needs a portable proof that identifies the authenticated user.

The repository signs:

```js
jwt.sign(
  { userId },
  process.env.jwt_secret,
  { expiresIn: '10d' }
)
```

## Three pieces

**Payload:** `{ userId }` — identity data needed by the server.

**Secret:** `process.env.jwt_secret` — used to sign and verify.

**Expiry:** `10d` — limits how long the token remains valid.

## JWT is encoded, not encrypted

Conceptually:

```text
header.payload.signature
```

The payload should not contain secrets. The signature allows the server to detect tampering.

## Cookie transport

The token is sent through:

```js
res.cookie('token', token, cookieOptions)
```

The browser stores it and can send it back on later requests.

## Verification middleware

The authentication middleware does:

```js
const token = req.cookies?.token
const decoded = jwt.verify(token, process.env.jwt_secret)
const user = await User.findById(decoded.userId)
req.user = user
next()
```

The critical sequence is:

```text
untrusted cookie
 ↓
verify JWT
 ↓
trusted userId
 ↓
load current user
 ↓
req.user
```

Never trust the payload before verification.

## Why query MongoDB after JWT verification?

The JWT identifies the user, but the current database contains the latest state: profile changes, followers, account state, etc.

The middleware therefore converts token identity into the current User document.

## Missing or invalid token

No cookie → `401 Authentication required`.

Invalid/expired token → `401 Invalid or expired token`.

Valid token but deleted user → `401 User not found`.

These are distinct stages of authentication failure.

## Secret consistency

Signing and verification must use the same secret.

A classic debugging symptom is:

```text
login succeeds
cookie exists
/users/me → 401
```

When this happens inspect cookie transport and JWT secret configuration before changing React code.

## What JWT does not solve

JWT does not automatically encrypt payloads, revoke tokens instantly, solve CSRF, or protect the backend without middleware.

It is one piece of the authentication architecture.

## Debug checklist

1. Is the cookie created?
2. Is `withCredentials: true` enabled?
3. Does the browser send the cookie?
4. Is `req.cookies.token` present?
5. Is the secret identical?
6. Is the token expired?
7. Does `decoded.userId` exist?
8. Does that user still exist in MongoDB?

## Interview
1. What does JWT verification prove?
2. Is a JWT encrypted?
3. Why query MongoDB after verification?
4. What happens when the secret changes?
5. How would you revoke tokens?