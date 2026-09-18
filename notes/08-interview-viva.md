# 08 — Interview and Viva Bank

## Architecture

1. Explain the request lifecycle from React click to MongoDB and back.
2. Why separate routes, middleware, controllers and models?
3. Why use a shared Axios instance?

## Authentication

4. Explain registration end to end.
5. Why bcrypt?
6. Hashing vs encryption?
7. Why sanitize user data?
8. Why set a cookie after login?
9. Why can login succeed while `/users/me` fails?

## JWT

10. What is inside a JWT?
11. Is a JWT encrypted?
12. What does signature verification guarantee?
13. Why query MongoDB after verification?
14. What happens when the secret changes?
15. How would you revoke tokens?

## React auth

16. Why does AuthContext need loading?
17. Explain the premature redirect race.
18. ProtectedRoute vs backend authorization?
19. Why use Context?
20. What is session restoration?

## Profile

21. What is `/profile/:username`?
22. What does useParams return?
23. Why does the effect depend on username?
24. What does populate do?

## Follow

25. Why store both follower and following relationships?
26. `$push` vs `$addToSet`?
27. `$pull`?
28. What happens if one of two follow writes fails?
29. When would you use a Follow collection?

## Upload

30. Why multipart/form-data?
31. What does Multer do?
32. What is memoryStorage?
33. Why size-limit uploads?
34. Why is MIME validation insufficient as complete security?

## Debugging scenarios

35. Login succeeds but `/users/me` returns 401.
36. Cookie exists in the browser but the server cannot see it.
37. Profile URL is correct but MongoDB returns 404.
38. Follow works once but becomes stale.
39. `req.file` is undefined.

For each, trace:

```text
UI → request → route → middleware → controller → database → response → state
```

## Practical assignment
Build `Block / Unblock User` using the same architecture:

```text
Protected route
 → authenticated actor
 → target parameter
 → MongoDB relation
 → React action state
 → loading/error handling
 → integration test
```


## Deep-Dive Viva Set

### Architecture

**Trace login end to end.**

Expected chain:

```text
Login.jsx
 -> Axios
 -> POST /users/login
 -> router
 -> loginUser
 -> User.findOne
 -> bcrypt.compare
 -> JWT
 -> cookie
 -> response
 -> AuthContext state
 -> /home
```

**Why separate routes, middleware, controllers and models?**

Each layer owns one concern: mapping, cross-cutting checks, business logic and data access/schema respectively.

### Authentication

**Why bcrypt?** Password storage needs a password-focused salted hashing function rather than plain storage.

**Hashing vs encryption?** Hashing is a verification-oriented one-way transformation; encryption is designed to be reversible with a key.

**Why sanitize responses?** The database contains fields the browser does not need, especially the password hash.

**Why can login succeed while `/users/me` fails?** Cookie transport, CORS, cookie parsing, JWT verification, secret configuration or user lookup can fail after the login response.

### JWT

**Is JWT encrypted?** No. Its payload is encoded and signed; do not use it as a secret container.

**Why query MongoDB after verification?** The token identifies a user, while MongoDB provides current application state.

**What does changing the secret do?** Existing tokens signed with the old secret will fail verification with the new secret.

### React authentication

**Why loading?** Because initial `user === null` means either guest or session-check-pending. Loading separates those states.

**Why is ProtectedRoute not security?** A user can call the API without using the React UI. Backend middleware must enforce authentication.

### Profile

**What does `useParams()` provide?** Route parameters, such as `username` from `/profile/mrinal`.

**Why populate?** It resolves referenced user IDs into selected display fields so the UI can show follower/following summaries without one request per user.

### Follow

**Where does actor ID come from?** `req.user._id`.

**Where does target ID come from?** `req.params.id`.

**Why `$addToSet`?** A follow relationship should not be duplicated in the array.

**What can go wrong with two writes?** One user can be updated while the second update fails, leaving inconsistent relationship data.

### Upload

**Why multipart/form-data?** It carries file bytes as multipart fields rather than treating binary content as ordinary JSON.

**What does Multer do?** It parses multipart uploads, applies limits/filters and exposes the file to the controller.

**Why memoryStorage?** It is convenient when forwarding the buffer to another storage service, but it increases RAM pressure for large or concurrent uploads.

### Debugging scenarios

**Login succeeds, `/users/me` is 401:** inspect cookie creation, credentialed requests, CORS, cookie parser, JWT secret, verification and user lookup in that order.

**Profile URL looks correct but 404:** inspect route parameter, `req.params.username` and exact database username.

**Follow succeeds but UI is stale:** inspect mutation response, profile refetch and `setUserData()`.

**`req.file` is undefined:** inspect multipart encoding, exact field name, Multer middleware, filter and file-size limit.

### Practical challenge

Implement `Block / Unblock User` while preserving the same architecture:

```text
React action
 -> Axios
 -> protected route
 -> authenticated actor
 -> target parameter
 -> MongoDB relation
 -> response
 -> React state
```

Then explain why the actor must come from authentication rather than from the request body.

### Final viva test

A student has understood this repository when they can take any feature and identify:

```text
UI
 -> request
 -> route
 -> middleware
 -> controller
 -> database
 -> response
 -> React state
```

using actual file names and actual code from the project.
