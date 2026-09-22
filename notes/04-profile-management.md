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

The edit modal now persists profile changes through `PUT /users/profile`. Text fields and an optional image are sent as `multipart/form-data`; Multer parses the request, the server uploads the image to Cloudinary, stores the returned URL in `User.profileImage`, and the client refetches the profile after saving.

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

## Deep Dive

### Dynamic route to database query

```text
/profile/mrinal
   -> useParams()
   -> username = mrinal
   -> GET /users/profile/mrinal
   -> req.params.username
   -> User.findOne({ username })
```

The backend then excludes the password and populates the relationship summaries.

### Viewed profile vs authenticated actor

These are different identities. A logged-in user Alex can visit `/profile/john`; John is the profile subject while Alex remains the authenticated actor. This distinction becomes critical for follow/unfollow and future profile editing.

### Populate

The model stores relationship IDs. The profile controller uses:

```js
.populate('followers', 'name username profileImage')
.populate('followings', 'name username profileImage')
```

This turns raw references into lightweight user summaries suitable for the UI.

### Own-profile logic

```js
const isOwnProfile = loggedInUser?.username === username
```

This derives the visible action: own profile shows edit controls; another profile shows follow/unfollow. UI visibility is not backend authorization.

### Effect dependency

The profile effect depends on `username` because navigation can move from `/profile/alex` to `/profile/john` while React reuses the same component instance. The parameter change must trigger a new request.

### Follow-state detection

The implementation reads `/users/me`, extracts IDs from the current user's `followings`, and compares them with the target profile `_id`. It accepts either populated objects or raw IDs, which makes the client tolerant of different response shapes.

### Edit-profile boundary

The current edit form changes local state only:

```js
setUserData((prev) => ({
  ...prev,
  ...editForm,
  profileImage: previewImage || prev.profileImage
}))
```

There is no persistent profile-update endpoint in the current B implementation. Therefore local UI change is not database persistence.

### Image preview boundary

`URL.createObjectURL(file)` creates a browser-local preview. It does not upload the image. A persistent upload requires `FormData`, a multipart request, Multer/server processing, storage and usually a saved URL.

### Debugging

Trace profile bugs in this order:

```text
route declaration
 -> current URL
 -> useParams()
 -> Axios URL
 -> req.params.username
 -> MongoDB query
 -> response shape
 -> setUserData()
 -> render
```

### Viva

Be ready to explain why `/profile/john` can be displayed by Alex, what `useParams()` returns, why `username` belongs in the effect dependency list, what `populate()` does, and why changing React state is not the same as persisting a profile update.
