# File Upload + Hardening — Deep Dive

## Commit
- 52d8d4c0493fc20c9394d2adf7774a8e06975d91 — Multer file processing

## Flow
```text
Browser
 ↓ multipart/form-data
Multer
 ↓ req.file
Controller
 ↓
storage/service
```

## Why multipart?
Files are binary data. multipart/form-data carries file parts plus normal form fields.

## Why memoryStorage?
The bytes are available without a temporary disk file. Trade-off: memory pressure, so limits matter.

## File filtering
The middleware rejects non-image MIME types and applies a size limit. MIME checks are a baseline, not complete content validation.

## Interview questions
1. Why multipart/form-data?
2. What does Multer do?
3. What is req.file?
4. Why memoryStorage?
5. Why is MIME validation insufficient by itself?
6. How would you connect this to Cloudinary?
