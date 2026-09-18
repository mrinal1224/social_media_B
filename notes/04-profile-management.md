# 04 — Profile Management

## Feature goal

The Profile feature answers two questions:

1. Which user profile are we viewing?
2. Is it our own profile?

## Dynamic route

The app defines:

```jsx
<Route path='/profile/:username' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
```

Examples:

```text
/profile/alex
/profile/john
/profile/mrinal
```

## `useParams()`

The Profile page reads:

```js
const { username } = useParams()
```

This is the viewed profile's username, not automatically the logged-in username.

Example:

```text
logged in: alex
URL: /profile/john
username: john
```

## Fetching profile data

The page sends:

```js
axiosInstance.get(`/users/profile/${username}`)
```

The backend reads:

```js
const { username } = req.params
```

and then queries:

```js
User.findOne({ username })
```

End-to-end:

```text
URL → useParams → Axios → req.params → MongoDB
```

## Response safety

The controller uses:

```js
.select('-password')
```

A profile page has no reason to receive password data.

## `populate()`

Followers and followings are stored as ObjectIds. The API populates only:

```text
name
username
profileImage
```

This is analogous to resolving contact IDs into small display cards.

## Own-profile logic

The component derives:

```js
const isOwnProfile =
  loggedInUser?.username === username
```

Own profile → Edit Profile.

Other profile → Follow/Unfollow.

This is derived state; it should not be duplicated in independent state unless there is a reason.

## Loading/error state

Profile keeps `userData`, `loading`, and `error` so the UI can explicitly represent:

```text
loading
success
not found / error
```

## Why `username` belongs in the effect dependency list

Navigation can reuse the same Profile component instance. Moving from `/profile/alex` to `/profile/sam` should trigger a new fetch.

## Current edit-profile boundary

The edit modal has controlled form state and image preview state, but the current B implementation's `handleEditSubmit` updates local UI state only. It does not yet send a persistence request to a backend update endpoint.

That distinction matters: a convincing UI is not the same as durable data persistence.

## Debug checklist

If profile fails:

1. Is the URL correct?
2. Is `/profile/:username` registered?
3. Did ProtectedRoute redirect?
4. Did Profile mount?
5. What is `useParams()`?
6. What exact Axios URL was sent?
7. What is `req.params.username`?
8. Does MongoDB contain that username?
9. What shape came back in the response?

## Interview
1. What is a dynamic route?
2. Why use `useParams()`?
3. Why depend on `username`?
4. What does `populate()` do?
5. What is derived state?
6. Why can a UI appear updated while the database remains unchanged?