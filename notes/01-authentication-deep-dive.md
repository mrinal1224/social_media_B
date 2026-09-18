# Authentication — Deep Dive

## Commit progression
- e4567fc — initial backend
- 0954fb9 — User model
- a331144 — registration controller
- 59afea0 — registration
- c948745 — password hashing
- ced9d56 — login controller
- d0c81b6 — JWT
- c8eed85 — token in cookie
- 8bde47c — JWT authentication with cookies

## Architecture
```text
React → Axios → Express route → Controller → Mongoose → MongoDB

Authentication adds:
password → bcrypt hash → JWT → cookie → auth middleware → req.user
```

## Password hashing
Never store plaintext passwords. bcrypt creates a salted password hash. Login verifies with `bcrypt.compare()`; the hash is not decrypted.

## JWT flow
```text
browser sends cookie
      ↓
auth middleware
      ↓
jwt.verify()
      ↓
decoded.userId
      ↓
User.findById()
      ↓
req.user
```

Decoding extracts token data. Verification checks that the token was signed with the expected secret and is otherwise valid.

## Why middleware?
The authentication check is cross-cutting. Middleware centralizes it instead of duplicating JWT parsing in every controller.

Analogy: a security guard verifies your badge at the entrance and hands the application a verified identity.

## Interview questions
1. Why hash instead of encrypt passwords?
2. Why salt?
3. Why bcrypt.compare?
4. What does a JWT prove?
5. Why use an HttpOnly cookie?
6. Why middleware?
7. Decode vs verify JWT?
8. What happens if the JWT secret changes?
9. What belongs in a JWT payload?
10. Why should frontend auth never be the only security boundary?

## Best practices
Use consistent secrets, production cookie flags, generic authentication errors where appropriate, normalized emails, and never return password hashes.