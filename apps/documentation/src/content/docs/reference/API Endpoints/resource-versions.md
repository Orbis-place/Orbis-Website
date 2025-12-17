---
title: Resource Versions
description: API reference for managing resource versions and downloads
---

Manage versions and files for marketplace resources.

## Base Endpoint

All version endpoints are prefixed with `/resources/:resourceId/versions`

---

## Create Version

```http
POST /resources/:resourceId/versions
```

Create a new version for a resource.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Request Body:**
```json
{
  "version": "1.0.0",
  "changelog": "Initial release",
  "hytaleVersionIds": ["hytale-version-id-1"],
  "isPreRelease": false
}
```

**Response:**
```json
{
  "id": "version-id",
  "resourceId": "resource-id",
  "version": "1.0.0",
  "changelog": "Initial release",
  "downloadCount": 0,
  "isPreRelease": false,
  "createdAt": "2024-01-01T00:00:00Z"
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
{
  "versions": [
    {
      "id": "version-id",
      "version": "1.0.0",
      "changelog": "Initial release",
      "downloadCount": 150,
      "fileCount": 2,
      "primaryFileId": "file-id",
      "isPreRelease": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "hytaleVersions": [...]
    }
  ]
}
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
  "version": {
    "id": "version-id",
    "version": "1.0.0",
    "changelog": "Initial release",
    "downloadCount": 150,
    "files": [...],
    "primaryFileId": "file-id",
    "hytaleVersions": [...]
  }
}
```

---

## Update Version

```http
PATCH /resources/:resourceId/versions/:versionId
```

Update a version's details.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Request Body:** (all fields optional)
```json
{
  "version": "1.0.1",
  "changelog": "Bug fixes",
  "hytaleVersionIds": ["version-id"],
  "isPreRelease": false
}
```

---

## Delete Version

```http
DELETE /resources/:resourceId/versions/:versionId
```

Delete a version.

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
- `file` (file) - File to upload (JAR, ZIP, etc.)
- `displayName` (string, optional) - Custom display name for the file

**Response:**
```json
{
  "id": "file-id",
  "versionId": "version-id",
  "fileName": "my-mod-1.0.0.jar",
  "displayName": "Main File",
  "fileSize": 1048576,
  "downloadCount": 0,
  "isPrimary": false,
  "downloadUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

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
  "fileId": "file-id"
}
```

---

## Download

### Download Specific File

```http
GET /resources/:resourceId/versions/:versionId/download/:fileId
```

Download a specific file from a version. This endpoint redirects to the actual download URL.

**Authentication:** Not required (but recommended for download tracking)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID
- `fileId` (string) - File ID

**Response:** HTTP 302 redirect to download URL

---

### Download Primary File

```http
GET /resources/:resourceId/versions/:versionId/download
```

Download the primary file of a version. This endpoint redirects to the actual download URL.

**Authentication:** Not required (but recommended for download tracking)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `versionId` (string) - Version ID

**Response:** HTTP 302 redirect to download URL

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

**Response:**
```json
{
  "message": "Version set as latest",
  "version": {
    "id": "version-id",
    "isLatest": true
  }
}
```
