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