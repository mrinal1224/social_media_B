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