---
title: Resource Likes
description: API reference for liking resources
---

Manage likes on marketplace resources.

## Base Endpoint

All resource likes endpoints are prefixed with `/resources/:resourceId/likes`

---

## Like Resource

```http
POST /resources/:resourceId/likes
```

Like a resource.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID to like

**Response:**
```json
{
  "message": "Resource liked successfully",
  "likeCount": 42
}
```

---

## Unlike Resource

```http
DELETE /resources/:resourceId/likes
```

Remove your like from a resource.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID to unlike

**Response:**
```json
{
  "message": "Resource unliked successfully",
  "likeCount": 41
}
```

---

## Check if Liked

```http
GET /resources/:resourceId/likes/me
```

Check if the current user has liked the resource.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "hasLiked": true
}
```

---

## Get Resource Likes

```http
GET /resources/:resourceId/likes
```

Get all likes for a resource.

**Authentication:** Not required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "likes": [
    {
      "id": "like-id",
      "userId": "user-id",
      "user": {
        "id": "user-id",
        "username": "username",
        "displayName": "Display Name",
        "image": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42
}
```
