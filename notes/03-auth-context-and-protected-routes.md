# 03 — AuthContext, Protected Routes and Public Routes

## The startup problem

AuthContext begins with:

```js
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
```

`user === null` does **not** immediately mean logged out. It may mean the app has not restored the session yet.

## Session restoration

On mount:

```js
const response = await axiosInstance.get('/users/me')
```

Valid session:

```js
setUser(response.data)
```

Invalid session:

```js
setUser(null)
```

Finally:

```js
setLoading(false)
```

## State machine

```text
UNKNOWN
 ├─ valid cookie → AUTHENTICATED
 └─ invalid/missing → GUEST
```

The `loading` state is therefore a real third state.

## ProtectedRoute

```js
const { user, loading } = useAuth()

if (loading) return <div>Loading...</div>

if (!user) {
  return <Navigate to='/login' replace />
}

return children
```

Order matters: wait, then decide.

## Why premature redirects happen

Bad timeline:

```text
React renders
 ↓
user is null
 ↓
ProtectedRoute redirects
 ↓
/users/me finally responds
```

The route treated `unknown` as `guest`.

This is a race/lifecycle problem, not a routing problem alone.

## PublicRoute

PublicRoute waits for auth restoration and redirects an authenticated user to `/home`.

It protects the user experience, not the backend API.

## Browser routing vs backend security

This distinction is critical:

```text
ProtectedRoute = navigation guard
isAuthenticated = server security boundary
```

A user can manually call the API even if a button is hidden. The server must still verify the cookie.

## Why `replace`?

`replace` prevents the redirected page from remaining as a confusing history entry.

## The mounted flag

AuthContext uses:

```js
let mounted = true
```

and cleanup sets it to false.

This protects against completing async work and trying to update state after the component tree is gone.

## Why Context?

Home, Profile, Login, ProtectedRoute and PublicRoute all need authentication information. Context avoids prop drilling for this small, cross-cutting state.

## Interview
1. Why three auth states?
2. Explain the premature redirect race.
3. Why is ProtectedRoute not a security boundary?
4. What does `replace` do?
5. Why is cleanup needed around async work?
6. When would Redux become justified?

## Deep Dive

### Auth is a state machine

The initial state is intentionally ambiguous:

```js
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
```

At startup, `user === null` does not necessarily mean logged out. It can mean session restoration has not completed.

```text
UNKNOWN
  -> /users/me
     -> authenticated
     -> guest
```

### Session restoration

The provider calls:

```js
const response = await axiosInstance.get('/users/me')
```

Success stores the returned user:

```js
setUser(response.data)
```

Failure treats the session as unauthenticated:

```js
setUser(null)
```

Finally:

```js
setLoading(false)
```

This creates a reliable bootstrap sequence: wait, restore, then decide.

### Why ProtectedRoute needs loading

Without loading, a valid session can produce this race:

```text
render
 -> user is temporarily null
 -> redirect to /login
 -> /users/me succeeds later
```

The guard therefore checks loading first:

```js
if (loading) return <div>Loading...</div>

if (!user) {
  return <Navigate to='/login' replace />
}

return children
```

### PublicRoute

PublicRoute applies the inverse UX rule. While loading, it waits. Once authenticated, it redirects to `/home`; otherwise it renders the public page.

### Why `replace` matters

Authentication redirects are automatic. `replace` keeps the blocked route from becoming a confusing browser-history entry.

### Mounted flag

AuthContext uses a mounted flag around async work. The idea is:

```text
request starts
 -> component may unmount
 -> request resolves later
 -> do not update state if no longer mounted
```

The cleanup sets the flag to false.

### Context vs backend security

Context is shared UI state. It does not secure APIs.

```text
ProtectedRoute
 -> navigation/UI guard

isAuthenticated
 -> backend security boundary
```

A malicious client can call an API without rendering the React page, so the backend must still verify the cookie.

### Login integration

Login updates shared state immediately:

```js
setUser(res.data.userData)
navigate('/home', { replace: true })
```

This means the home screen can render the user immediately instead of waiting for another bootstrap request.

### Debugging

For a redirect loop or login flash, inspect the state timeline:

```text
initial user
loading value
/users/me request
response status
setUser()
setLoading(false)
ProtectedRoute decision
```

If a valid user is redirected before the request finishes, the bug is usually the loading state or its handling.
