---
title: Resource Versions
description: API reference for managing resource versions and downloads
---

Manage versions and files for marketplace resources.

## Base Endpoint

All version endpoints are prefixed with `/resources/:resourceId/versions`

---

## Version Lifecycle

Versions follow a moderation workflow:

```
DRAFT → PENDING → APPROVED
              ↓
          REJECTED → (resubmit) → PENDING
```

### Status Types

- **DRAFT**: Initial state, editable by owner
- **PENDING**: Submitted for review, awaiting moderator action
- **APPROVED**: Approved by moderator, publicly available
- **REJECTED**: Rejected by moderator, can be resubmitted
- **ARCHIVED**: Old version, read-only

### Release Channels

- **RELEASE**: Stable release (production-ready)
- **BETA**: Beta version (feature complete, testing phase)
- **ALPHA**: Alpha/experimental version (early access, unstable)
- **SNAPSHOT**: Development builds (unstable, frequent updates)

---

## Create Version

```http
POST /resources/:resourceId/versions
```

Create a new version (starts as DRAFT).

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Request Body:**
```json
{
  "versionNumber": "1.0.0",
  "name": "The Adventure Update",
  "channel": "RELEASE",
  "compatibleHytaleVersionIds": ["hytale-version-id-1"]
}
```

**Fields:**
- `versionNumber` (string, required) - Version number (e.g., "1.0.0", "2.1.3-beta")
- `name` (string, optional) - Optional version name
- `channel` (string, required) - Release channel: `RELEASE`, `BETA`, `ALPHA`, or `SNAPSHOT`
- `compatibleHytaleVersionIds` (string[], required) - Array of compatible Hytale version IDs (minimum 1)

**Response:**
```json
{
  "id": "ver_abc123",
  "resourceId": "res_xyz789",
  "versionNumber": "1.0.0",
  "name": "The Adventure Update",
  "channel": "RELEASE",
  "status": "DRAFT",
  "changelog": null,
  "downloads": 0,
  "isLatest": false,
  "createdAt": "2026-01-10T19:00:00.000Z",
  "updatedAt": "2026-01-10T19:00:00.000Z",
  "compatibleHytaleVersions": [...],
  "files": []
}
```

---

## Get All Versions

```http
GET /resources/:resourceId/versions
```

Get all versions for a resource.

**Authentication:** Not required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
[
  {
    "id": "ver_abc123",
    "versionNumber": "1.0.0",
    "name": "The Adventure Update",
    "channel": "RELEASE",
    "status": "APPROVED",
    "downloads": 1523,
    "isLatest": true,
    "createdAt": "2026-01-10T19:00:00.000Z",
    "files": [...]
  }
]
```

---

## Get Version by ID

```http
GET /resources/:resourceId/versions/:versionId
```

Get details of a specific version.

**Authentication:** Not required

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Response:**
```json
{
  "id": "ver_abc123",
  "resourceId": "res_xyz789",
  "versionNumber": "1.0.0",
  "name": "The Adventure Update",
  "channel": "RELEASE",
  "status": "APPROVED",
  "changelog": "# Version 1.0.0\n\n- Added new features\n- Fixed bugs",
  "downloads": 1523,
  "isLatest": true,
  "createdAt": "2026-01-10T19:00:00.000Z",
  "updatedAt": "2026-01-10T19:15:00.000Z",
  "compatibleHytaleVersions": [...],
  "files": [...]
}
```

---

## Update Version

```http
PATCH /resources/:resourceId/versions/:versionId
```

Update a version's details. **Only editable in DRAFT or REJECTED status.**

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:** (all fields optional)
```json
{
  "name": "The Epic Adventure Update",
  "channel": "BETA",
  "compatibleHytaleVersionIds": ["version-id"]
}
```

**Response:** Updated version object

---

## Delete Version

```http
DELETE /resources/:resourceId/versions/:versionId
```

Delete a version. **Cannot delete PENDING or APPROVED versions.**

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Response:**
```json
{
  "message": "Version deleted successfully"
}
```

---

## Changelog

### Update Changelog

```http
PATCH /resources/:resourceId/versions/:versionId/changelog
```

Update the version changelog. **Allowed in all statuses except ARCHIVED.**

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:**
```json
{
  "changelog": "# Version 1.0.0\n\n## New Features\n- Feature A\n- Feature B\n\n## Bug Fixes\n- Fixed bug X"
}
```

**Note:** Changelog supports HTML format and is displayed with Tiptap editor.

**Response:** Updated version object

---

## Workflow

### Submit Version for Review

```http
POST /resources/:resourceId/versions/:versionId/submit
```

Submit a DRAFT version for moderation review (DRAFT → PENDING).

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:** (optional)
```json
{
  "submissionNote": "First stable version, ready for publication"
}
```

**Requirements:**
- Version status must be DRAFT
- Must have at least 1 file uploaded

**Response:** Version object with status PENDING

---

### Resubmit Rejected Version

```http
POST /resources/:resourceId/versions/:versionId/resubmit
```

Resubmit a rejected version for review (REJECTED → PENDING).

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Requirements:**
- Version status must be REJECTED
- Must have at least 1 file uploaded

**Response:** Version object with status PENDING

---

### Approve Version (Moderators Only)

```http
POST /resources/:resourceId/versions/:versionId/approve
```

Approve a pending version for public release (PENDING → APPROVED).

**Authentication:** Required (must be MODERATOR or ADMIN)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Requirements:**
- Version status must be PENDING
- User must have MODERATOR or ADMIN role

**Response:** Version object with status APPROVED

---

### Reject Version (Moderators Only)

```http
POST /resources/:resourceId/versions/:versionId/reject
```

Reject a pending version (PENDING → REJECTED).

**Authentication:** Required (must be MODERATOR or ADMIN)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:**
```json
{
  "reason": "The file contains malicious code. Please fix and resubmit."
}
```

**Requirements:**
- Version status must be PENDING
- User must have MODERATOR or ADMIN role
- Rejection reason is required

**Response:** Version object with status REJECTED

---

## Version Files

### Upload Version File

```http
POST /resources/:resourceId/versions/:versionId/files
```

Upload a file for a version.

**Authentication:** Required (must be owner or contributor)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Form Data:**
- `file` (file, required) - File to upload
- `displayName` (string, optional) - Custom display name for the file

**Supported File Types:**
- JAR, ZIP, RAR, 7Z, TAR, GZ
- PNG, JPG, WEBP, GIF
- MP4, WEBM
- TXT, MD, JSON, YAML, YML, TOML, XML
- Others (auto-detected)

**Response:**
```json
{
  "id": "file_def456",
  "versionId": "ver_abc123",
  "fileName": "myfile.jar",
  "displayName": "MyPlugin-v1.0.0.jar",
  "fileSize": 2048576,
  "fileType": "JAR",
  "isPrimaryFile": true,
  "uploadedAt": "2026-01-10T19:30:00.000Z"
}
```

**Note:** The first uploaded file automatically becomes the primary file.

---

### Delete Version File

```http
DELETE /resources/:resourceId/versions/:versionId/files/:fileId
```

Delete a file from a version.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID
- `fileId` (string) - File ID

**Restrictions:**
- Cannot delete the last file from a PENDING or APPROVED version
- If deleting the primary file, another file will be automatically set as primary

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

### Set Primary File

```http
PATCH /resources/:resourceId/versions/:versionId/files/primary
```

Set a file as the primary download for a version.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:**
```json
{
  "fileId": "file_xyz789"
}
```

**Response:** Updated version object

---

## Download

### Download Specific File

```http
GET /resources/:resourceId/versions/:versionId/download/:fileId
```

Download a specific file from a version. Redirects to signed download URL.

**Authentication:** Not required (but tracked if authenticated)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID
- `fileId` (string) - File ID

**Behavior:**
- Increments download counter (deduplicated by IP - once per day)
- Records download statistics (IP, user-agent, userId if authenticated)
- Redirects to signed S3/R2 download URL (1 hour expiration)

**Response:** HTTP 302 redirect to download URL

---

### Download Version (Smart Download)

```http
GET /resources/:resourceId/versions/:versionId/download
```

Smart download endpoint:
- **1 file**: Redirects to primary file download
- **Multiple files**: Generates and streams a ZIP archive containing all files

**Authentication:** Not required (but tracked if authenticated)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Behavior (Single File):**
- HTTP 302 redirect to primary file download URL

**Behavior (Multiple Files):**
- Generates ZIP archive on-the-fly (no temporary storage)
- Streams files directly from S3/R2
- ZIP filename: `{resourceSlug}-{versionNumber}.zip`
- Increments download counter once for the entire version

**ZIP Structure Example:**
```
MyPlugin-1.0.0.zip
├── MyPlugin-1.0.0.jar
├── config.yml
└── README.md
```

**Response:**
- Single file: HTTP 302 redirect
- Multiple files: HTTP 200 with ZIP stream

---

## Version Management

### Set as Latest Version

```http
PATCH /resources/:resourceId/versions/:versionId/set-latest
```

Mark this version as the latest version for the resource.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Requirements:**
- Version status must be APPROVED
- Only one version can be marked as latest (automatically unsets previous)

**Response:**
```json
{
  "id": "ver_abc123",
  "isLatest": true,
  ...
}
```

---

## Permissions

### Permission Matrix

| Action | Owner/Contributor | Moderator | Public |
|--------|-------------------|-----------|--------|
| Create version | ✅ | ❌ | ❌ |
| View versions | ✅ | ✅ | ✅ (APPROVED only) |
| Update version | ✅ (DRAFT/REJECTED) | ❌ | ❌ |
| Delete version | ✅ (DRAFT/REJECTED) | ❌ | ❌ |
| Upload files | ✅ | ❌ | ❌ |
| Submit/Resubmit | ✅ | ❌ | ❌ |
| Approve/Reject | ❌ | ✅ | ❌ |
| Download | ✅ | ✅ | ✅ (APPROVED only) |
| Set as latest | ✅ | ❌ | ❌ |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid data or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource or version not found |
| 409 | Conflict | Action not allowed in current status |
| 500 | Internal Server Error | Server error |

### Common Errors

**Cannot submit without files:**
```json
{
  "statusCode": 409,
  "message": "Cannot submit version: at least one file must be uploaded",
  "error": "Conflict"
}
```

**Insufficient permissions:**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to manage this resource",
  "error": "Forbidden"
}
```

**Invalid status transition:**
```json
{
  "statusCode": 409,
  "message": "Cannot edit version in PENDING status",
  "error": "Conflict"
}
```
