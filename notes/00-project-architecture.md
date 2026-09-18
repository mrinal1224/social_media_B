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