# 00 — Project Architecture

## Goal
Understand the React → Express → MongoDB request lifecycle used by this repository.

## Request path

```text
Browser / React
      ↓ HTTP
Axios instance
      ↓
Express
      ↓ CORS / JSON / cookies
/users router
      ↓ middleware when required
controller
      ↓
Mongoose
      ↓
MongoDB
```

The response travels back as JSON and updates React state.

## Server entry point

The project configures dotenv, MongoDB, CORS, `express.json()`, `cookieParser()` and the `/users` router.

Why `express.json()`? It parses JSON bodies so controllers can read `req.body`.

Why `cookieParser()`? Authentication is carried in a cookie, and the middleware exposes it as `req.cookies`.

Why `credentials: true` in CORS? The browser must be allowed to send authentication cookies on cross-origin development requests.

## Router composition

The server mounts:

```js
app.use('/users', userRoutes)
```

The router declares:

```js
userRoutes.post('/login', loginUser)
```

Together the real endpoint is `POST /users/login`.

Analogy: `/users` is the building, `/login` is the room.

## MVC responsibilities

**Route:** maps method + URL to an operation.

**Middleware:** decides whether a request can continue.

**Controller:** performs the business operation.

**Model:** defines data and database operations.

Keeping these responsibilities separate makes features easier to debug and test.

## Frontend architecture

```text
Pages/          feature screens
components/     route guards
context/        global auth state
axiosCalls/     shared HTTP configuration
App.jsx         route composition
```

The shared Axios instance uses:

```js
axios.create({
  baseURL: 'http://localhost:8085/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})
```

`baseURL` removes repeated host strings. `withCredentials` allows the browser to send cookies.

## A feature is a chain

Follow is not one function. It is:

```text
Button
 ↓
React state
 ↓
Axios
 ↓
Express route
 ↓
auth middleware
 ↓
controller
 ↓
MongoDB
 ↓
response
 ↓
React state refresh
```

When debugging, trace the chain instead of staring at one file.

## Practice
Draw the request lifecycle for register, login, `/users/me`, profile and follow.

## Interview
1. Why separate routes and controllers?
2. What does `cookieParser()` do?
3. Why is `withCredentials` important?
4. What happens if `express.json()` is removed?
5. Frontend route protection vs backend authorization?

## Deep Dive

### Why the architecture matters

A full-stack request crosses multiple layers. This repository keeps those layers separate:

```text
React UI
 -> Axios
 -> Express
 -> Route
 -> Middleware
 -> Controller
 -> Mongoose
 -> MongoDB
 -> Response
 -> React state
```

Each layer has a different job. That makes the code easier to explain, debug and extend.

### Server startup order

The server configures CORS, JSON parsing, cookie parsing and finally the user router:

```js
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

app.use(express.json())
app.use(cookieParser())
app.use('/users', userRoutes)
```

Think of Express middleware as a pipeline. A later stage can only rely on earlier parsing/setup if it has already run.

### Why `express.json()` matters

The frontend sends JSON bodies such as:

```json
{
  "email": "mrinal@example.com",
  "password": "secret123"
}
```

`express.json()` parses the body so controllers can read `req.body`.

Without it, authentication controllers would not receive the expected parsed object.

### Why `cookieParser()` matters

Authentication is transported in a cookie. The auth middleware expects:

```js
req.cookies?.token
```

`cookieParser()` exposes browser cookies in that form.

### Why CORS credentials matter

The development frontend runs on one origin and the API on another. The Axios client uses:

```js
withCredentials: true
```

and the server allows credentialed requests with:

```js
credentials: true
```

If the two sides do not agree, authentication may appear to work during login but fail on later requests because the cookie is not being transported as expected.

### Router composition

The server mounts:

```js
app.use('/users', userRoutes)
```

The router then defines:

```js
userRoutes.post('/login', loginUser)
```

Together they form:

```text
POST /users/login
```

This keeps route modules focused on one domain instead of repeating the entire URL prefix.

### Middleware vs controller

Middleware asks:

```text
Can this request continue?
```

For authentication, that means verifying identity and attaching `req.user`.

The controller asks:

```text
What business operation should happen now?
```

For example:

```text
isAuthenticated -> identify actor
followUser       -> mutate relationship
```

### Controller vs model

The controller decides the application operation. The model represents the database structure and provides persistence operations.

This separation means the controller can say:

```js
User.findById(targetUserId)
```

without embedding MongoDB connection details into every route.

### Frontend architecture

The current client separates responsibilities into:

```text
App.jsx             -> route composition
Pages/              -> screens/features
components/         -> reusable route guards
context/            -> shared authentication state
axiosCalls/         -> HTTP client configuration
```

The shared Axios client prevents every page from repeating the API host and credential settings.

### Trace a real login request

```text
Login.jsx
 -> handleSubmit()
 -> axiosInstance.post('/users/login')
 -> Express
 -> /users router
 -> loginUser()
 -> User.findOne()
 -> bcrypt.compare()
 -> genToken()
 -> res.cookie()
 -> sanitized JSON response
 -> setUser()
 -> navigate('/home')
```

If a student can explain this without opening the code, they understand the architecture.

### Trace a real profile request

```text
Profile.jsx
 -> useParams()
 -> GET /users/profile/:username
 -> isAuthenticated
 -> getUserProfile()
 -> User.findOne()
 -> populate()
 -> response
 -> setUserData()
 -> render
```

### Trace follow

```text
Follow button
 -> handleFollowToggle()
 -> POST /users/:id/follow
 -> isAuthenticated
 -> followUser()
 -> update actor
 -> update target
 -> refetch profile
 -> setUserData()
```

### Debug by layer

If the UI handler never runs, debug React.

If the request URL or body is wrong, debug Axios/form state.

If the route returns 404, debug route registration and parameters.

If it returns 401, debug authentication middleware, cookies or JWT.

If it returns 500, debug controller/database/runtime errors.

If the response is correct but UI is stale, debug state updates and effects.

### Architecture interview prompts

Be able to explain:

1. Why route and controller are separate.
2. Why authentication belongs in middleware.
3. Why database logic belongs behind a model abstraction.
4. Why AuthContext is frontend state, not backend security.
5. Why a shared Axios instance is preferable to repeated request configuration.
6. What exact files a login request passes through.
