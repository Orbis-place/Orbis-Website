---
title: Resource Tags
description: API reference for resource tags
---

Browse and search resource tags used for categorizing marketplace content.

## Base Endpoint

All resource tag endpoints are prefixed with `/resource-tags`

---

## Get All Tags

```http
GET /resource-tags
```

Get all resource tags with optional search.

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
      "name": "Magic",
      "slug": "magic",
      "description": "Magical spells and abilities",
      "usageCount": 42,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

---

## Search Tags

```http
GET /resource-tags/search
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
      "name": "Magic",
      "slug": "magic",
      "usageCount": 42
    }
  ]
}
```

---

## Get Popular Tags for Type

```http
GET /resource-tags/popular/:type
```

Get the most popular tags for a specific resource type.

**Authentication:** Not required

**URL Parameters:**
- `type` (string) - Resource type (MOD, PLUGIN, TEXTURE_PACK, TOOLS_SCRIPTS)

**Query Parameters:**
- `limit` (number, optional) - Maximum number of results (default: 20)

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-id",
      "name": "Magic",
      "slug": "magic",
      "usageCount": 42,
      "resourceType": "MOD"
    }
  ]
}
```

---

## Get Tag by Slug

```http
GET /resource-tags/slug/:slug
```

Get a specific tag by its slug.

**Authentication:** Not required

**URL Parameters:**
- `slug` (string) - Tag slug (e.g., "magic")

**Response:**
```json
{
  "id": "tag-id",
  "name": "Magic",
  "slug": "magic",
  "description": "Magical spells and abilities",
  "usageCount": 42,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Get Tag by ID

```http
GET /resource-tags/:id
```

Get a specific tag by its ID.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Tag ID

**Response:**
```json
{
  "id": "tag-id",
  "name": "Magic",
  "slug": "magic",
  "description": "Magical spells and abilities",
  "usageCount": 42,
  "createdAt": "2024-01-01T00:00:00Z"
}
```
