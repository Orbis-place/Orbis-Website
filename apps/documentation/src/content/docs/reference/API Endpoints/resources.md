---
title: Resources
description: Complete API reference for Resources endpoints
---

Manage marketplace resources including mods, plugins, tools, and scripts.

## Base Endpoint

All resource endpoints are prefixed with `/resources`

---

## Resource Management

### Get All Resources

```http
GET /resources
```

Get all approved resources with optional filters for the public marketplace.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `type` (string, optional) - Filter by resource type (MOD, PLUGIN, TEXTURE_PACK, TOOLS_SCRIPTS)
- `search` (string, optional) - Search query for resource name
- `tags` (array, optional) - Filter by tag IDs
- `categories` (array, optional) - Filter by category IDs
- `versions` (array, optional) - Filter by Hytale version IDs
- `sort` (string, optional) - Sort order (newest, popular, downloads)
- `limit` (number, optional) - Number of results per page
- `offset` (number, optional) - Pagination offset

**Response:**
```json
{
  "resources": [...],
  "total": 100
}
```

---

### Get Resource Categories

```http
GET /resources/categories
```

Get categories filtered by resource type.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `type` (string, optional) - Filter categories by resource type

---

### Create Resource

```http
POST /resources
```

Create a new resource.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Resource",
  "slug": "my-resource",
  "shortDescription": "A brief description",
  "description": "Full markdown description",
  "type": "MOD",
  "categoryIds": ["cat-id-1", "cat-id-2"],
  "tagIds": ["tag-id-1", "tag-id-2"],
  "hytaleVersionIds": ["version-id-1"],
  "ownerId": "user-or-team-id",
  "ownerType": "USER"
}
```

---

### Get My Resources

```http
GET /resources/me
```

Get resources owned by the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page

---

### Get Resource by ID

```http
GET /resources/:id
```

Get a specific resource by its ID.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Resource ID

---

### Get Resource by Slug

```http
GET /resources/slug/:slug
```

Get a resource by its unique slug.

**Authentication:** Optional (returns additional data if authenticated)

**URL Parameters:**
- `slug` (string) - Resource slug

---

### Update Resource

```http
PATCH /resources/:id
```

Update an existing resource.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `id` (string) - Resource ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "shortDescription": "Updated description",
  "description": "Updated full description",
  "categoryIds": ["new-cat-id"],
  "tagIds": ["new-tag-id"],
  "hytaleVersionIds": ["version-id"]
}
```

---

### Delete Resource

```http
DELETE /resources/:id
```

Delete a resource.

**Authentication:** Required (must be owner)

**URL Parameters:**
- `id` (string) - Resource ID

---

## Resource Files

### Upload Resource Icon

```http
POST /resources/:id/icon
```

Upload an icon image for a resource.

**Authentication:** Required (must be owner or contributor)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `icon` (file) - Image file (PNG, JPG, WEBP)

**URL Parameters:**
- `id` (string) - Resource ID

---

### Upload Resource Banner

```http
POST /resources/:id/banner
```

Upload a banner image for a resource.

**Authentication:** Required (must be owner or contributor)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `banner` (file) - Image file (PNG, JPG, WEBP)

**URL Parameters:**
- `id` (string) - Resource ID

---

## User/Team Resources

### Get User Resources

```http
GET /resources/user/:userId
```

Get all resources created by a specific user.

**Authentication:** Not required

**URL Parameters:**
- `userId` (string) - User ID

**Query Parameters:**
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page

---

### Get Team Resources

```http
GET /resources/team/:teamId
```

Get all resources created by a specific team.

**Authentication:** Not required

**URL Parameters:**
- `teamId` (string) - Team ID

**Query Parameters:**
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page

---

## Moderation

### Get Pending Resources

```http
GET /resources/moderation/pending
```

Get resources pending moderation approval.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**Query Parameters:**
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page

---

### Get Resources by Status

```http
GET /resources/moderation/status/:status
```

Get resources filtered by moderation status.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `status` (string) - Resource status (PENDING, APPROVED, REJECTED, SUSPENDED)

**Query Parameters:**
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page

---

### Moderate Resource

```http
PATCH /resources/moderation/:id/moderate
```

Approve, reject, or suspend a resource.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `id` (string) - Resource ID

**Request Body:**
```json
{
  "action": "APPROVE",
  "reason": "Optional moderation note"
}
```

**Actions:** `APPROVE`, `REJECT`, `SUSPEND`, `UNSUSPEND`

---

### Get Resource Moderation History

```http
GET /resources/moderation/:id/history
```

Get the moderation history for a resource.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `id` (string) - Resource ID

---

## External Links

### Get External Links

```http
GET /resources/:id/external-links
```

Get all external links for a resource.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Resource ID

---

### Create External Link

```http
POST /resources/:id/external-links
```

Add an external link to a resource.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `id` (string) - Resource ID

**Request Body:**
```json
{
  "title": "GitHub Repository",
  "url": "https://github.com/user/repo",
  "type": "GITHUB"
}
```

**Link Types:** `GITHUB`, `DISCORD`, `WEBSITE`, `DOCUMENTATION`, `OTHER`

---

### Reorder External Links

```http
PATCH /resources/:id/external-links/reorder
```

Reorder external links by changing their display order.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `id` (string) - Resource ID

**Request Body:**
```json
{
  "linkIds": ["link-id-1", "link-id-2", "link-id-3"]
}
```

---

### Update External Link

```http
PATCH /resources/:id/external-links/:linkId
```

Update an external link.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `id` (string) - Resource ID
- `linkId` (string) - Link ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "url": "https://new-url.com"
}
```

---

### Delete External Link

```http
DELETE /resources/:id/external-links/:linkId
```

Delete an external link.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `id` (string) - Resource ID
- `linkId` (string) - Link ID
