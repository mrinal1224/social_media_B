# 01 — Authentication

## What are we solving?
Authentication answers: **Who is this user?**

This project uses:

```text
Registration
 ↓
Password hashing
 ↓
Login
 ↓
JWT
 ↓
HttpOnly cookie
 ↓
Authentication middleware
```

## Registration

The controller reads:

```js
const { name, username, email, password } = req.body
```

Then validates required fields and password length.

A request rejected early should `return` immediately. Otherwise execution could continue after a response has already been sent.

## Uniqueness

The implementation checks username and email with `findOne()` before creating the account. The schema also marks both as unique.

The teaching point: application validation gives a useful error message; database constraints protect integrity.

## Password hashing

```js
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(password, salt)
```

We never store the raw password.

Registration is:

```text
password → bcrypt → stored representation
```

Login is:

```text
submitted password + stored representation → bcrypt.compare()
```

Hashing is not encryption; the server does not need to recover the original password.

## Session establishment

After registration or login:

```js
const token = genToken(user._id)
res.cookie('token', token, cookieOptions)
```

The account is therefore created/logged in and the browser receives its authentication credential.

## Sanitisation

The repository uses:

```js
const sanitizeUser = (user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user }
    delete safeUser.password
    return safeUser
}
```

This is important because the database representation is not automatically the API representation.

## Frontend login

Login submits form state:

```js
const res = await axiosInstance.post('/users/login', form)
setUser(res.data.userData)
navigate('/home', { replace: true })
```

This is the bridge from server authentication to React authentication state.

## Form state

Inputs update one property using the previous state:

```js
setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
```

That is a controlled form.

## Loading state

Login and signup maintain a loader so repeated clicks do not easily create concurrent submissions.

## Important contract issue

Registration returns `user`, while login currently returns `userData`. Both work, but standardising response shapes makes full-stack code easier to reason about.

## Interview
1. Hashing vs encryption?
2. Why salt passwords?
3. Why sanitize the User object?
4. Why can login succeed while `/users/me` fails?
5. Why standardise response shapes?

# Extended Deep-Dive

## 1. Complete request lifecycle

```text
Browser -> React state -> Axios -> Express -> Router -> Controller -> bcrypt/MongoDB -> JWT -> Cookie -> Response -> React state
```

Authentication is not one function. It is a chain of layers.

## 2. Registration line-by-line

The controller starts by reading `req.body`:

```js
const { name, username, email, password } = req.body
```

Then it uses guard clauses:

```js
if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
}
```

The `return` is important: after sending the response, the success path must stop. This is a guard-clause pattern that keeps backend code readable.

The controller then checks the username and email, hashes the password, inserts the user, creates a JWT, sets the cookie and returns a sanitized object.

## 3. Why bcrypt is used

The repository uses:

```js
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(password, salt)
```

Think of it as:

```text
plain password + random salt -> bcrypt -> stored hash
```

The same password chosen by two users can therefore lead to different stored hashes because their salts can differ. The cost factor also makes guessing more expensive.

Hashing is not encryption:

```text
Encryption: plaintext -> ciphertext -> plaintext
Hashing:    password  -> hash
```

The application does not decrypt the password. During login it asks bcrypt to verify the candidate password against the stored hash.

## 4. Login verification

The login controller first finds the user:

```js
const user = await User.findOne({ email })
```

Then it compares:

```js
const passwordMatched = await bcrypt.compare(password, user.password)
```

Conceptually:

```text
candidate password + stored bcrypt hash -> true / false
```

On success:

```js
const token = genToken(user._id)
res.cookie('token', token, cookieOptions)
```

The JWT contains the user identity:

```js
jwt.sign({ userId }, process.env.jwt_secret, { expiresIn: '10d' })
```

## 5. Why sanitize the user

The project uses:

```js
const sanitizeUser = (user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user }
    delete safeUser.password
    return safeUser
}
```

The database object contains sensitive information that the browser does not need. Removing `password` follows the least-exposure principle.

A useful mental model is:

```text
Database object -> safe API DTO -> browser
```

## 6. Cookie and React state are different

After login the frontend runs:

```js
setUser(res.data.userData)
```

That is UI state, not the authentication credential itself.

The credential is the JWT in the browser cookie. React state can disappear during a refresh; the browser cookie can survive the refresh, allowing session restoration.

## 7. Session restoration

On app startup `AuthContext` calls:

```js
axiosInstance.get('/users/me')
```

The protected route is:

```js
userRoutes.get('/me', isAuthenticated, getMe)
```

The middleware reads:

```js
const token = req.cookies?.token
```

Then verifies it:

```js
const decoded = jwt.verify(token, process.env.jwt_secret)
```

Then loads the actual user:

```js
const user = await User.findById(decoded.userId)
```

Then attaches it to:

```js
req.user = user
```

Finally `getMe` returns:

```js
sanitizeUser(req.user)
```

So refresh becomes:

```text
cookie -> JWT verify -> userId -> MongoDB user -> req.user -> React user state
```

## 8. Why `/users/me` is necessary

If React only relied on `useState(null)`, a browser refresh would make the UI forget the user. `/users/me` allows the frontend to ask the backend to reconstruct the session from the browser's existing credential.

## 9. Debugging a 401

If login succeeds but `/users/me` returns 401, trace the chain in order:

```text
1. Is the cookie stored?
2. Is it attached to the request?
3. Is Axios using withCredentials: true?
4. Is CORS using credentials: true?
5. Does cookieParser run before the routes?
6. Does req.cookies.token exist?
7. Does jwt.verify succeed?
8. Is jwt_secret correct?
9. Does decoded.userId exist?
10. Does User.findById(decoded.userId) return a user?
```

This is much faster than random console logging.

## 10. Current implementation vs production hardening

Current B implementation has:

```js
{ httpOnly: true }
```

for the cookie. A production system may additionally need deployment-appropriate `secure`, `sameSite`, CSRF strategy, rate limiting, stronger validation and safer error responses.

The repository also has different response keys for registration and login: registration uses `user`, while login uses `userData`. The implementation works, but a consistent API contract is easier to consume.

## 11. Viva answer: explain signup

A strong answer is:

> The controlled React form sends JSON to `/users/register`. Express parses it, the router invokes `registerUser`, the controller validates the input and checks duplicates, bcrypt hashes the password, MongoDB stores the new user, a JWT is generated from the user ID, the JWT is written to an HttpOnly cookie, the password is removed from the response object, and the frontend navigates onward.

## 12. Viva answer: explain login

> The frontend posts email and password to `/users/login`. The controller finds the user by email, bcrypt compares the candidate password against the stored hash, and on success the server signs a JWT, stores it in an HttpOnly cookie and returns a sanitized user object. React stores that safe user object in AuthContext and navigates to the home page.

## 13. Key takeaways

```text
Credentials -> validation -> bcrypt -> database
Login -> compare -> JWT -> cookie
Future request -> cookie -> verify -> user lookup -> req.user
```

The main goal is to understand the entire lifecycle rather than memorize isolated APIs.
