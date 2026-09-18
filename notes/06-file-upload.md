# 06 — File Upload and Multer

## Why JSON is not enough

JSON is excellent for text and structured data. File upload uses `multipart/form-data`.

The B repository currently isolates parsing with:

```js
userRoutes.post(
  '/testUpload',
  upload.single('profileImage'),
  testUpload
)
```

## Multer middleware

```js
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('The File is not an Image'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})
```

Three responsibilities are visible: where bytes go, which files are accepted, and how large they may be.

## Memory storage

`memoryStorage()` means the upload is kept in RAM and exposed through `req.file`.

Useful when the next stage forwards the buffer directly to object storage.

Trade-off: memory is finite. Size limits are essential.

## MIME filtering

The project checks `file.mimetype.startsWith('image/')`.

This is useful first-line filtering, but a production system may additionally inspect file signatures and decode/transform the image before serving it.

## Field-name contract

The backend expects:

```text
profileImage
```

The client must send the same multipart field name.

If the names disagree, `req.file` may be missing even though the browser selected a file.

## Current implementation boundary

The current B endpoint sends `req.file` directly back. It is a teaching/test endpoint rather than a complete Cloudinary persistence feature.

That makes it useful as an isolated lesson: first understand request parsing, then add storage as a separate concern.

## Production pipeline

```text
Browser file
 ↓ FormData
multipart/form-data
 ↓ Multer
req.file
 ↓ validation / processing
Cloudinary or object storage
 ↓ URL
MongoDB metadata
```

## Interview
1. Why multipart/form-data?
2. What does Multer do?
3. What is `req.file`?
4. Why memoryStorage?
5. Why are file-size limits necessary?
6. Why is MIME type alone not complete security?
7. Why must field names match?

## Deep Dive

### Multipart request

File uploads use `multipart/form-data` because a file is binary data. The route expects one file under the exact field name `profileImage`:

```js
userRoutes.post('/testUpload', upload.single('profileImage'), testUpload)
```

### Multer responsibilities

Multer parses the multipart request, applies the file filter, applies the 5 MB limit and exposes the parsed file as `req.file`.

```text
Browser file
 -> FormData
 -> multipart HTTP request
 -> Multer
 -> req.file
 -> controller
```

### Why field names matter

The client and server must use the same field name:

```js
formData.append('profileImage', file)
```

and:

```js
upload.single('profileImage')
```

If they disagree, `req.file` may be undefined.

### memoryStorage tradeoff

`multer.memoryStorage()` keeps bytes in RAM. That is convenient when the next step sends a buffer to cloud storage, but large concurrent uploads can consume significant memory. The size limit is therefore an important protection.

### MIME validation

The current filter checks `file.mimetype.startsWith('image/')`. That is useful first-line filtering, but production systems may also inspect file signatures and safely decode or transform the image.

### Preview is not persistence

`URL.createObjectURL(file)` creates a local browser preview. It does not store the file on the server.

```text
preview: file -> browser URL -> img
upload:  file -> FormData -> server -> storage -> URL
```

### Current implementation boundary

The current controller simply sends `req.file` back. This proves parsing works; it is not a complete permanent media-storage pipeline.

### Production flow

```text
browser
 -> FormData
 -> Multer
 -> validation / transform
 -> Cloudinary or object storage
 -> URL
 -> User.profileImage
```

### Debugging

For `req.file === undefined`, check file selection, FormData, field name, multipart content type, `upload.single()`, filter rejection and the 5 MB limit.

### Viva

Explain why JSON is not the normal upload format, what Multer does, why memory storage needs a file-size limit, and why a local preview URL does not mean the image is persisted.
