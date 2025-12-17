---
title: Resource Contributors
description: API reference for managing resource contributors
---

Manage contributors for marketplace resources. Contributors can help manage and update resources.

## Base Endpoint

All contributor endpoints are prefixed with `/resources/:resourceId/contributors`

---

## Add Contributor

```http
POST /resources/:resourceId/contributors
```

Add a contributor to a resource.

**Authentication:** Required (must be resource owner)

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Request Body:**
```json
{
  "userId": "user-id-to-add",
  "role": "CONTRIBUTOR"
}
```

**Contributor Roles:**
- `CONTRIBUTOR` - Can edit resource details and upload files
- `MAINTAINER` - Can edit, upload, and manage other contributors

**Response:**
```json
{
  "id": "contributor-id",
  "userId": "user-id",
  "resourceId": "resource-id",
  "role": "CONTRIBUTOR",
  "user": {
    "id": "user-id",
    "username": "username",
    "displayName": "Display Name",
    "image": "https://..."
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Get Contributors

```http
GET /resources/:resourceId/contributors
```

Get all contributors for a resource.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "contributors": [
    {
      "id": "contributor-id",
      "userId": "user-id",
      "role": "CONTRIBUTOR",
      "user": {
        "id": "user-id",
        "username": "username",
        "displayName": "Display Name",
        "image": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Update Contributor Role

```http
PATCH /resources/:resourceId/contributors/:userId
```

Update a contributor's role.

**Authentication:** Required (must be resource owner or maintainer)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `userId` (string) - Contributor user ID

**Request Body:**
```json
{
  "role": "MAINTAINER"
}
```

**Response:**
```json
{
  "id": "contributor-id",
  "role": "MAINTAINER",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Remove Contributor

```http
DELETE /resources/:resourceId/contributors/:userId
```

Remove a contributor from a resource.

**Authentication:** Required (must be resource owner or maintainer)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `userId` (string) - Contributor user ID to remove

**Response:**
```json
{
  "message": "Contributor removed successfully"
}
```
