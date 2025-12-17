---
title: Server Categories
description: API reference for server categories
---

Browse server categories used for organizing game servers.

## Base Endpoint

All server category endpoints are prefixed with `/server-categories`

---

## Get All Categories

```http
GET /server-categories
```

Get all server categories.

**Authentication:** Not required

**Response:**
```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Survival",
      "slug": "survival",
      "description": "Survival mode servers",
      "iconUrl": "https://...",
      "usageCount": 85,
      "order": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Get Category by Slug

```http
GET /server-categories/:slug
```

Get a specific category by its slug.

**Authentication:** Not required

**URL Parameters:**
- `slug` (string) - Category slug (e.g., "survival")

**Response:**
```json
{
  "id": "category-id",
  "name": "Survival",
  "slug": "survival",
  "description": "Survival mode servers",
  "iconUrl": "https://...",
  "usageCount": 85,
  "order": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```
