# Social Media B — Master Feature & Debugging Notes

## What stage is this repo?
B is the reconstruction/debugging stage. It begins with the same authentication foundation as the earlier project, then adds profile navigation and the social graph by intentionally matching the A implementation.

## Commit progression
| Date | Representative commits | Learning stage |
|---|---|---|
| 1 Sep | e4567f → 59afea | project, User model, register |
| 1 Sep | c948745 → d0c81b | bcrypt, login, JWT |
| 2 Sep | c8eed85 → 8bde47c | cookie authentication |
| 8–9 Sep | afbc0e → 6ec7445 | signup/login UI, AuthContext, route guards |
| 15 Sep | 7e6d5b → 45b3437 | profile navigation + profile UI |
| 15–16 Sep | 4b016cf → 14fd273 | follow/unfollow implementation |
| 16 Sep | 58d5358 → f2b7843 | navigation/auth loading fixes + file processing |

## The big lesson: feature replication is contract replication
The follow feature was not copied file-by-file blindly. The important thing to reproduce is the contract:
```text
UI button
 ↓
HTTP verb + URL
 ↓
route
 ↓
auth middleware
 ↓
controller
 ↓
MongoDB relationship update
 ↓
profile refetch
 ↓
UI state
```
If any layer uses a different URL, parameter name, response shape, or state assumption, the feature breaks.

## Authentication loading bugs
B contains several commits specifically fixing premature redirects. The problem is a race:
```text
React starts
user = null
loading = true
       ↓
PublicRoute renders too early
       ↓
redirect happens before /users/me finishes
```
Analogy: asking “is the train late?” before checking whether the station clock has even loaded.

Correct mental model:
```text
loading = true  → wait
loading = false + user → authenticated
loading = false + no user → guest
```

## Profile routing
`Home` links to `/profile/${user.username}` and `Profile` reads the parameter with `useParams()`.
Trace bugs in order:
1. Is the Link URL correct?
2. Does App.jsx register `/profile/:username`?
3. Does `useParams()` contain the expected username?
4. Does Axios send the same username?
5. Does Express read `req.params.username`?
6. Does MongoDB contain that username?

## Follow/unfollow
B intentionally converges toward A's implementation. The schema uses `followers` and `followings` as ObjectId arrays with `ref: User`. The controller updates both sides with `$addToSet` / `$pull`.

### Why `$addToSet`?
It behaves like inserting into a mathematical set rather than a normal array. A repeated follow does not create another identical reference.

### Why populate?
Profile cards need names/usernames/images, not only ObjectIds.

## Important differences worth teaching
B's history is valuable because it contains real debugging work: auth loading, response normalisation, profile loading, signup submit flow, and matching the source repo. This is closer to production engineering than a clean “build once” tutorial.

## Current best-practice gaps to discuss
- Use one consistent route naming convention for unfollow (`DELETE /:id/follow` is often simpler than a different `/unfollow` path).
- Centralise API response contracts.
- Add a logout flow that invalidates client state explicitly.
- Validate and normalise email/username consistently.
- Use production cookie flags deliberately.
- Add integration tests around the profile and follow APIs.
- Use transaction/consistency strategy for the two follow writes.

## Interview questions
1. Why do auth guards need a loading state?
2. What exact race condition causes premature redirects?
3. How do you debug a `useParams()` value that appears undefined?
4. Why should frontend routes mirror backend resource contracts carefully?
5. `$addToSet` vs `$push`?
6. How would you test follow/unfollow without clicking the UI?
7. What does a protected frontend route actually protect?
8. How would you design an idempotent follow API?
9. What happens if the profile request succeeds but the follow-state request fails?
10. How would you improve error boundaries and request cancellation on unmount?

## Debugging workflow
Observe → reproduce → inspect Network tab → log boundary inputs (`params`, `body`, `req.user`) → inspect DB → inspect response shape → inspect React state → fix the contract at the correct layer.
