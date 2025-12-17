---
title: Hytale Versions
description: API reference for Hytale game versions
---

Get information about Hytale game versions used for compatibility tracking.

## Base Endpoint

All Hytale version endpoints are prefixed with `/hytale-versions`

---

## Get All Hytale Versions

```http
GET /hytale-versions
```

Get all Hytale versions.

**Authentication:** Not required

**Response:**
```json
{
  "versions": [
    {
      "id": "version-id",
      "hytaleVersion": "1.0.0",
      "name": "Initial Release",
      "releaseDate": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "version-id-2",
      "hytaleVersion": "1.1.0",
      "name": "First Update",
      "releaseDate": "2024-02-01T00:00:00Z",
      "createdAt": "2024-02-01T00:00:00Z"
    }
  ]
}
```

**Notes:**
- Versions are returned in descending order by creation date (newest first)
- These versions are used to tag resources and indicate compatibility
- Users can filter marketplace resources by compatible Hytale versions
