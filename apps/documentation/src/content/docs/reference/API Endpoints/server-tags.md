---
title: Server Tags
description: API reference for server tags
---

Browse and search server tags used for categorizing game servers.

## Base Endpoint

All server tag endpoints are prefixed with `/server-tags`

---

## Get All Tags

```http
GET /server-tags
```

Get all server tags with optional search.

**Authentication:** Not required

**Query Parameters:**
- `search` (string, optional) - Search query for tag name
- `limit` (number, optional) - Maximum number of results (default: 100)

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-id",
      "name": "PvP",
      "slug": "pvp",
      "description": "Player versus Player combat",
      "usageCount": 120,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

---

## Search Tags

```http
GET /server-tags/search
```

Search tags for autocomplete functionality.

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, optional) - Maximum number of results (default: 10)

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-id",
      "name": "PvP",
      "slug": "pvp",
      "usageCount": 120
    }
  ]
}
```

---

## Get Popular Tags

```http
GET /server-tags/popular
```

Get the most popular server tags.

**Authentication:** Not required

**Query Parameters:**
- `limit` (number, optional) - Maximum number of results (default: 20)

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-id",
      "name": "PvP",
      "slug": "pvp",
      "usageCount": 120
    }
  ]
}
```

---

## Get Tag by Slug

```http
GET /server-tags/:slug
```

Get a specific tag by its slug.

**Authentication:** Not required

**URL Parameters:**
- `slug` (string) - Tag slug (e.g., "pvp")

**Response:**
```json
{
  "id": "tag-id",
  "name": "PvP",
  "slug": "pvp",
  "description": "Player versus Player combat",
  "usageCount": 120,
  "createdAt": "2024-01-01T00:00:00Z"
}
```
