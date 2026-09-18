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