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