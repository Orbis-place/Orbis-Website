---
title: Servers
description: Complete API reference for Servers endpoints
---

Manage Hytale game servers and server listings.

## Base Endpoint

All server endpoints are prefixed with `/servers`

---

## Server Management

### Get All Servers

```http
GET /servers
```

Get all servers with optional filters.

**Authentication:** Not required

**Query Parameters:**
- `search` (string, optional) - Search query for server name
- `categories` (array, optional) - Filter by category IDs
- `tags` (array, optional) - Filter by tag IDs
- `sort` (string, optional) - Sort order (rank, players, newest)
- `limit` (number, optional) - Results per page
- `offset` (number, optional) - Pagination offset

**Response:**
```json
{
  "servers": [...],
  "total": 100
}
```

---

### Get User Servers

```http
GET /servers/user/:userId
```

Get all servers owned by a specific user.

**Authentication:** Optional (shows additional data if authenticated)

**URL Parameters:**
- `userId` (string) - User ID

**Response:**
```json
{
  "servers": [
    {
      "id": "server-id",
      "name": "My Server",
      "slug": "my-server",
      "ip": "play.example.com",
      "port": 25565,
      "onlinePlayers": 50,
      "maxPlayers": 100,
      "rank": 1,
      "logoUrl": "https://...",
      "bannerUrl": "https://..."
    }
  ]
}
```

---

### Create Server

```http
POST /servers
```

Create a new server listing.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Server",
  "slug": "my-server",
  "shortDescription": "A great server",
  "description": "Full markdown description",
  "ip": "play.example.com",
  "port": 25565,
  "categoryIds": ["cat-id-1"],
  "tagIds": ["tag-id-1", "tag-id-2"],
  "ownerId": "user-or-team-id",
  "ownerType": "USER"
}
```

**Owner Types:** `USER`, `TEAM`

---

### Get Server by Slug

```http
GET /servers/slug/:slug
```

Get a server by its unique slug.

**Authentication:** Optional

**URL Parameters:**
- `slug` (string) - Server slug

**Response:**
```json
{
  "id": "server-id",
  "name": "My Server",
  "slug": "my-server",
  "shortDescription": "A great server",
  "description": "Full description",
  "ip": "play.example.com",
  "port": 25565,
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "onlinePlayers": 50,
  "maxPlayers": 100,
  "rank": 5,
  "categories": [...],
  "tags": [...],
  "owner": {...}
}
```

---

### Update Server

```http
PATCH /servers/:id
```

Update server details.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "shortDescription": "Updated description",
  "description": "Updated full description",
  "ip": "new.example.com",
  "port": 25565,
  "categoryIds": ["cat-id"],
  "tagIds": ["tag-id"]
}
```

---

### Transfer Server Ownership

```http
POST /servers/:id/transfer-ownership
```

Transfer server ownership to another user or team.

**Authentication:** Required (must be current owner)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "newOwnerId": "user-or-team-id",
  "ownerType": "USER"
}
```

**Owner Types:** `USER`, `TEAM`

**Response:**
```json
{
  "message": "Server ownership transferred successfully",
  "server": {
    "id": "server-id",
    "ownerId": "new-owner-id",
    "ownerType": "USER"
  }
}
```

---

### Delete Server

```http
DELETE /servers/:id
```

Delete a server listing.

**Authentication:** Required (must be owner)

**URL Parameters:**
- `id` (string) - Server ID

---

## Server Assets

### Upload Server Logo

```http
POST /servers/:id/logo
```

Upload a logo image for a server.

**Authentication:** Required (must be owner or team member)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (string) - Server ID

**Form Data:**
- `logo` (file) - Image file (PNG, JPG, WEBP)

---

### Upload Server Banner

```http
POST /servers/:id/banner
```

Upload a banner image for a server.

**Authentication:** Required (must be owner or team member)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (string) - Server ID

**Form Data:**
- `banner` (file) - Image file (PNG, JPG, WEBP)

---

### Delete Server Logo

```http
DELETE /servers/:id/logo
```

Delete the server logo.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID

---

### Delete Server Banner

```http
DELETE /servers/:id/banner
```

Delete the server banner.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID

---

## Moderation

### Approve Server

```http
POST /servers/moderation/:id/approve
```

Approve a pending server.

**Authentication:** Required (Admin or Moderator)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "notes": "Optional moderation notes"
}
```

---

### Reject Server

```http
POST /servers/moderation/:id/reject
```

Reject a pending server.

**Authentication:** Required (Admin or Moderator)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "reason": "Reason for rejection",
  "notes": "Additional notes"
}
```

---

### Suspend Server

```http
POST /servers/moderation/:id/suspend
```

Suspend a server.

**Authentication:** Required (Admin or Moderator)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "reason": "Reason for suspension",
  "notes": "Additional notes"
}
```

---

## Social Links

### Get Server Social Links

```http
GET /servers/:id/social-links
```

Get all social links for a server.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Server ID

**Response:**
```json
{
  "socialLinks": [
    {
      "id": "link-id",
      "platform": "DISCORD",
      "url": "https://discord.gg/...",
      "order": 0
    }
  ]
}
```

**Platforms:** `DISCORD`, `TWITTER`, `YOUTUBE`, `TWITCH`, `WEBSITE`, `OTHER`

---

### Create Social Link

```http
POST /servers/:id/social-links
```

Add a social link to a server.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "platform": "DISCORD",
  "url": "https://discord.gg/..."
}
```

---

### Update Social Link

```http
PATCH /servers/:id/social-links/:linkId
```

Update a social link.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID
- `linkId` (string) - Social link ID

**Request Body:**
```json
{
  "platform": "DISCORD",
  "url": "https://discord.gg/new-invite"
}
```

---

### Delete Social Link

```http
DELETE /servers/:id/social-links/:linkId
```

Delete a social link.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID
- `linkId` (string) - Social link ID

---

### Reorder Social Links

```http
PATCH /servers/:id/social-links/reorder
```

Reorder social links.

**Authentication:** Required (must be owner or team member)

**URL Parameters:**
- `id` (string) - Server ID

**Request Body:**
```json
{
  "linkIds": ["link-id-1", "link-id-2", "link-id-3"]
}
```
