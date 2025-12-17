---
title: Resource Favorites
description: API reference for favoriting resources
---

Manage favorite resources for authenticated users.

## Base Endpoint

Resource favorites endpoints are prefixed with `/resources/:resourceId/favorites`

---

## Add to Favorites

```http
POST /resources/:resourceId/favorites
```

Add a resource to your favorites.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID to favorite

**Response:**
```json
{
  "message": "Resource added to favorites",
  "favoriteCount": 15
}
```

---

## Remove from Favorites

```http
DELETE /resources/:resourceId/favorites
```

Remove a resource from your favorites.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID to unfavorite

**Response:**
```json
{
  "message": "Resource removed from favorites",
  "favoriteCount": 14
}
```

---

## Check if Favorited

```http
GET /resources/:resourceId/favorites/me
```

Check if the current user has favorited the resource.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "hasFavorited": true
}
```

---

## Get My Favorites

```http
GET /user/favorites
```

Get all favorite resources for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "favorites": [
    {
      "id": "favorite-id",
      "resourceId": "resource-id",
      "resource": {
        "id": "resource-id",
        "name": "Resource Name",
        "slug": "resource-slug",
        "shortDescription": "...",
        "iconUrl": "https://...",
        "type": "MOD"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```
