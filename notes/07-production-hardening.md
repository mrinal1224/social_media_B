# 07 — Production Hardening

## 1. Secret management

The B repository currently contains a tracked `server/.env` file. If it contains real credentials, those credentials should be treated as exposed.

Preferred pattern:

```text
.env         → ignored
.env.example → committed
```

Deleting a secret from the latest commit is not the same as rotating it.

## 2. Cookie security

The current cookie configuration is only:

```js
{ httpOnly: true }
```

Production deployment should deliberately configure Secure and SameSite according to the actual HTTPS and cross-origin setup.

## 3. Request validation

Manual checks work for learning. Larger systems should centralise schemas for body, params, query and file metadata.

## 4. Error handling

Controllers currently repeat try/catch patterns. A central Express error handler can standardise unexpected failures.

## 5. Response contracts

The project mixes response keys such as `user` and `userData`. Standardise API contracts so frontend code does not depend on accidental differences.

## 6. Relationship consistency

Follow changes two User documents. A production system should consider transactions or a relationship collection depending on scale and query needs.

## 7. Rate limiting

Good candidates:

```text
/register
/login
/follow
/unfollow
```

## 8. Testing

Integration tests should cover:

```text
register
login
me
profile
follow
unfollow
upload parsing
```

Test both HTTP response and database side effects.

## 9. Authorization boundary

`ProtectedRoute` improves navigation UX.

`isAuthenticated` protects the API.

Do not confuse them.

## Interview
1. Why is committing `.env` dangerous?
2. How do you rotate exposed secrets?
3. Why centralise errors?
4. What is a transaction?
5. Why might a Follow collection scale differently from User arrays?
6. Where should rate limiting exist?

## Deep Dive

### Secret management

The repository contains a tracked `server/.env` path. If it contains real credentials, those credentials should be treated as exposed and rotated. A safer pattern is:

```text
.env -> ignored
.env.example -> committed placeholders
```

Deleting a secret from the latest commit does not erase it from Git history.

### Cookie hardening

Current configuration is:

```js
{ httpOnly: true }
```

Production should deliberately review `secure`, `sameSite`, domain/path behavior, HTTPS and appropriate expiration. The correct values depend on the actual deployment topology.

### Validation hardening

Current validation is inline. As the API grows, central schemas can validate body, params, query and file metadata consistently.

### Error handling

Controllers currently repeat try/catch blocks. A centralized Express error handler can standardize unexpected failures:

```text
controller -> next(error) -> error middleware -> safe response
```

Detailed diagnostics should be logged server-side while public responses stay safe.

### API contracts

Register returns `user` while login returns `userData`. Standardizing response shapes reduces frontend branching and accidental integration bugs.

### Relationship consistency

Follow/unfollow updates two User documents. Transactions or a dedicated Follow collection may be appropriate at larger scale, depending on consistency and query requirements.

### Rate limiting

Important targets include login, registration and password reset. Uploads and relationship mutations may also need abuse controls.

### Testing

Test HTTP behavior and database side effects. For example, after follow succeeds, verify both the actor's `followings` and target's `followers` changed.

### Authorization

`ProtectedRoute` is a navigation guard. `isAuthenticated` is the backend identity boundary. Future mutation endpoints also need endpoint-specific authorization, such as ownership checks.

### Deployment checklist

```text
secrets managed
HTTPS
cookie settings
CORS reviewed
validation
safe errors
rate limits
indexes
authorization
integration tests
monitoring/logging
```

### Viva

For each production hardening item, explain which concrete bug, attack or failure mode it reduces.
