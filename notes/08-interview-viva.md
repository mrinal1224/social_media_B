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
