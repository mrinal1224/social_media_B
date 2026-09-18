# Profile Feature — Deep Dive

## Commit progression
- 7e6d5b4 — profile navigation from Home
- 076e8c0 — user not getting fetched
- 45b3437 — profile section UI

## Contract
```text
Home
 ↓
/profile/<username>
 ↓
App route /profile/:username
 ↓
useParams()
 ↓
GET /users/profile/:username
 ↓
Express req.params
 ↓
MongoDB
```

## Why bugs appear at boundaries
A profile issue can come from the Link URL, route definition, ProtectedRoute redirect, parameter name, Axios path, backend response shape, or MongoDB data.

Therefore debug boundary-by-boundary rather than staring only at Profile.jsx.

## Follow-state preview
The profile page eventually needs two different facts: the viewed profile and whether the authenticated user follows that profile.

## Interview questions
1. How does a route param move from browser to MongoDB?
2. Why can useParams be correct while the request is wrong?
3. What should a profile API return?
4. Where should loading/error state live?
5. How would you cache profile requests?
