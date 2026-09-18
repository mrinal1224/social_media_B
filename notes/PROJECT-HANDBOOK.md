# Social Media B — Project Implementation Handbook

> Intermediate-stage project notes. This stage is mainly about profile navigation, social-graph features, frontend/backend state synchronisation and debugging real integration failures.

## 1. The New Problem: State Synchronisation

The project now connects:

```text
Authentication
 ↓
Home
 ↓
Profile
 ↓
Follow / Unfollow
 ↓
Follower + Following data
```

The backend owns the real relationship state. React mirrors it.

## 2. User as a Graph Node
For A follows B:

```text
A.followings → B
B.followers  → A
```

Think of users as nodes and follow relationships as directed edges.

## 3. `populate()`
MongoDB stores ObjectIds. The profile screen needs display information such as name, username and profileImage.

`populate()` resolves those references.

Analogy: an address book stores contact IDs, while the UI needs the contact card.

Selective populate is important because related documents should expose only the fields the UI needs.

## 4. Dynamic Profile Navigation
Home links to `/profile/${user.username}`.

App defines `/profile/:username`.

Profile calls `useParams()`.

Full chain:

```text
Home
 ↓ Link
Browser URL
 ↓
React Router
 ↓
Profile
 ↓ useParams()
Axios
 ↓
Express req.params
 ↓
MongoDB
```

## 5. Own Profile vs Other Profile
The component derives:

```js
const isOwnProfile = loggedInUser?.username === username
```

This is derived state. We do not need another piece of state that can become inconsistent.

Own profile → Edit Profile.
Other profile → Follow/Unfollow.

## 6. Follow State
`isFollowing` answers one question:

> Does the current user's followings contain the viewed user's id?

That is a set-membership check.

## 7. Follow API
Typical request:

```text
POST /users/:id/follow
```

The server gets the authenticated user from `req.user` and the target user from `req.params.id`.

Validation should include target existence, self-follow prevention and duplicate prevention.

## 8. Why `$addToSet`?
With `$push`:

```text
[A, B] + B → [A, B, B]
```

With `$addToSet`:

```text
[A, B] + B → [A, B]
```

For social relationships, set semantics are usually closer to the business requirement.

## 9. Unfollow
Unfollow removes references from both directions using `$pull`.

Before:

```text
A → B
```

After:

```text
A    B
```

## 10. Why Refetch After Mutation?
After follow/unfollow, B refreshes profile data.

Why?

The server is the source of truth.

Analogy: a banking app does not permanently trust a local balance after a transfer; it eventually reconciles with the server.

## 11. Action Loading
`actionLoading` models:

```text
Idle
 ↓
Requesting
 ↓
Success / Failure
 ↓
Idle
```

This prevents accidental repeated clicks and gives the UI feedback.

## 12. Authentication Loading Race
The project contains multiple fixes around premature redirects.

Bad mental model:

```text
user = null → logged out
```

Correct mental model:

```text
loading=true  → unknown
loading=false + user → authenticated
loading=false + null → guest
```

Analogy: do not declare a parcel lost while the tracking system is still loading.

## 13. API Response Contracts
A frontend bug can happen even when the backend is correct if the response shape changes.

For example:

```text
response.data.user
```

and:

```text
response.data.userData
```

are different contracts.

Full-stack feature development therefore means keeping contracts stable.

## 14. Error States
A good profile flow should distinguish:

```text
loading
success
empty/not found
error
```

A blank screen is not a useful application state.

## 15. File Upload Boundary
The upload work begins using multipart/form-data and Multer.

```text
Browser
 ↓ multipart/form-data
Multer
 ↓ req.file
Controller
```

This is fundamentally different from JSON APIs.

## 16. Production Improvements
- Consistent route conventions.
- Centralised API response contracts.
- Explicit logout/client state reset.
- Consistent email/username normalisation.
- Production cookie configuration.
- Integration tests.
- Atomicity/consistency strategy for two relationship writes.

## 17. Debugging Playbook
### Profile broken
Check: link → route → protected wrapper → component mount → useParams → request URL → req.params → database.

### Follow broken
Check: button → isFollowing → HTTP method → URL → cookie → auth middleware → req.user → target id → MongoDB update → response → refetch → UI state.

## 18. Interview Questions
1. Why store both followers and followings?
2. Why use `$addToSet`?
3. Why refetch after follow?
4. What is optimistic UI?
5. Why do we need `actionLoading`?
6. Why is auth loading different from unauthenticated?
7. What causes premature redirects?
8. What is an API contract?
9. What happens if one of the two follow updates fails?
10. How would you make the follow operation atomic?

## 19. Practice
- Implement block/unblock using the same graph model.
- Add private accounts.
- Add remove-follower.
- Add mutual-follower lookup.
- Write integration tests for the profile and follow APIs.

## Final Mental Model
```text
UI → HTTP contract → route → middleware → controller → database → server response → UI state
```