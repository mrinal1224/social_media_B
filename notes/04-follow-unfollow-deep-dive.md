# Follow / Unfollow — Deep Dive

## Source-repo matching stage
- 11e326a — source follow/unfollow profile flow
- 329ca88 — mirror source profile UI
- db7b47b — align follow routes
- 3d39b1a — match followings schema
- cecb805 — match source routes
- af8cc6c — implement source logic
- 14fd273 — match Social Media A implementation
- f2b7843 — completed stage

The lesson is contract matching, not blind file copying.

## Contract
```text
button
 ↓
HTTP method + URL
 ↓
Express route
 ↓
auth middleware
 ↓
controller
 ↓
MongoDB relationship update
 ↓
profile refetch
 ↓
React state
```

If one layer uses a different URL, parameter name, field name or response shape, the feature breaks.

## Data model
```text
A.followings = [B]
B.followers  = [A]
```

## Why $addToSet?
It behaves like set insertion, preventing duplicates.

## Why populate?
The profile needs names/usernames/images, not raw ObjectIds.

## Consistency problem
Two user documents are updated. One can succeed while the other fails. Discuss transactions, relationship collections, reconciliation, and source-of-truth design.

## Interview questions
1. What exactly is being matched from repo A?
2. Why is API contract more important than copying code?
3. Why use $addToSet?
4. How do you make follow idempotent?
5. How do you test duplicate follow?
6. How would you scale millions of relationships?
7. What if the first write succeeds and the second fails?
