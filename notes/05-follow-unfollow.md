# 05 — Follow / Unfollow

## Feature model

For A follows B:

```text
A.followings → B
B.followers  → A
```

This is a directed graph: users are nodes and relationships are edges.

## Schema

```js
followers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]

followings: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

## Actor vs target

The Follow API uses:

```text
actor = req.user._id
 target = req.params.id
```

This is a critical design decision. The browser chooses the target, but the server derives the actor from authenticated identity.

## Validation

The controller rejects:

- self-follow;
- missing target user;
- duplicate follow.

Duplicate detection uses the target's follower list.

## `$addToSet`

The current user update is:

```js
await User.findByIdAndUpdate(currentUserId, {
  $addToSet: { followings: targetUserId }
})
```

The target update is:

```js
await User.findByIdAndUpdate(targetUserId, {
  $addToSet: { followers: currentUserId }
})
```

Why not `$push`?

```text
[A, B] + B using $push
→ [A, B, B]
```

With `$addToSet`:

```text
[A, B] + B
→ [A, B]
```

The operator matches the business semantics of a relationship set.

## Unfollow

Unfollow uses `$pull` on the same two arrays.

## Frontend state machine

```text
NOT FOLLOWING
     ↓ follow
FOLLOWING
     ↓ unfollow
NOT FOLLOWING
```

The `isFollowing` state drives which HTTP operation is sent.

## Action loading

`actionLoading` becomes true before the request and false in `finally`.

This prevents repeated clicks and ensures the button is unlocked after both success and failure.

## Why refetch?

After a relationship mutation, the page fetches the profile again. This makes the server authoritative for follower/following counts and lists.

Advanced alternative: optimistic UI with rollback if the request fails.

## Consistency problem

A single follow action performs two database updates.

If update 1 succeeds and update 2 fails, the graph becomes inconsistent.

Production choices include MongoDB transactions or a dedicated Follow collection.

## Alternative model: Follow collection

Instead of arrays:

```text
Follow {
  actor,
  target,
  createdAt
}
```

Advantages can include easier querying, timestamps, moderation and very large graph scalability. Arrays are simple and convenient for this educational project.

## Interview
1. Why store followers and followings?
2. `$addToSet` vs `$push`?
3. Why derive the actor from `req.user`?
4. What is idempotency?
5. What happens if one update fails?
6. When would a Follow collection be preferable?

## Deep Dive

### Actor vs target

The server derives the actor from authenticated identity:

```js
const currentUserId = req.user._id
const targetUserId = req.params.id
```

This is a security principle: the client chooses the target, but cannot impersonate the actor.

### Relationship graph

For `A follows B` the schema represents both directions:

```text
A.followings contains B
B.followers contains A
```

That makes reads convenient but creates a consistency responsibility because one action updates two documents.

### Validation sequence

The controller checks:

```text
self follow
   -> reject
missing target
   -> reject
already following
   -> reject
otherwise
   -> update both users
```

### Why `$addToSet`

```js
$addToSet: { followings: targetUserId }
```

matches the semantics of a relationship set. Repeating the same relationship does not create another identical array element. `$push` would permit duplicates.

### Unfollow

```js
$pull: { followings: targetUserId }
$pull: { followers: currentUserId }
```

`$pull` removes matching values directly.

### Two writes and consistency

A follow action performs two updates:

```text
A.followings += B
B.followers  += A
```

If the first succeeds and the second fails, the graph becomes asymmetric. Larger systems may use MongoDB transactions or model relationships in a dedicated Follow collection.

### Frontend state machine

```text
NOT FOLLOWING
   -> follow request
ACTION LOADING
   -> success
FOLLOWING
   -> unfollow request
ACTION LOADING
   -> success
NOT FOLLOWING
```

`isFollowing` describes relationship state; `actionLoading` describes request state. They are intentionally separate.

### Refetch strategy

The current Profile page refetches the profile after follow/unfollow. This makes the server authoritative for counts and relationship lists. An optimistic update can be faster but requires rollback on failure.

### Debugging

Trace:

```text
button handler
 -> isFollowing
 -> POST or DELETE URL
 -> auth middleware
 -> target lookup
 -> MongoDB update
 -> profile refetch
 -> React state
```

### Scaling discussion

A dedicated relation model can represent:

```js
{
  follower: A,
  following: B,
  createdAt: Date
}
```

That design can be more flexible for timestamps, moderation, pagination and large relationship graphs. The current embedded arrays are simple and appropriate for learning the core concept.

### Viva

Explain exactly where actor ID comes from, where target ID comes from, why `$addToSet` is used instead of `$push`, and what failure mode is created by two independent writes.
