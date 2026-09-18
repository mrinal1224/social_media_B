# Route Guards + Auth Loading — Deep Dive

## Commit progression
- 3b3a8f9 — AuthContext
- 4a29775 — wrapper routing components
- 366658a — login refresh issue investigation
- 6ec7445 — Protected Routes
- 404fc76 — protected navigation loading fix
- 9170206 — premature redirect fix
- 58d5358 — profile navigation
- 428d0de — public-route loading fix

## Auth is a state machine
Three states matter:

```text
UNKNOWN → AUTHENTICATED
       ↘ GUEST
```

`loading=true` means UNKNOWN. It does not mean logged out.

## Why premature redirects happen
At first render, user may be null while the browser session is still being restored. If a guard checks only the user, it can redirect before `/users/me` finishes.

Correct flow:
```text
App starts
 ↓
loading=true
 ↓
GET /users/me
 ↓
response
 ↓
setUser()
 ↓
loading=false
 ↓
route decision
```

Analogy: asking a security guard whether a guest is authorised before the guest's ID has even been scanned.

## ProtectedRoute
```text
loading → wait
no user → login
user → children
```
This is navigation UX, not backend authorization.

## Why B has multiple loading fixes
The history captures real iteration: implement → observe wrong redirect → trace lifecycle → introduce loading state → normalize response → stabilize navigation.

## Interview questions
1. Why are user=null and loading=true different states?
2. What is the race condition?
3. Can ProtectedRoute secure an API?
4. What happens when `/users/me` returns 401?
5. Where should authorization live?
6. How would you test the redirect lifecycle?

## Best practices
Explicit auth state machine, ignore stale async responses, centralize auth restoration, and keep backend authorization independent.
