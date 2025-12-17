---
title: Users
description: Complete API reference for Users endpoints
---

Manage user profiles, social links, follows, and user content.

## Base Endpoint

All user endpoints are prefixed with `/users`

---

## User Profile

### Get My Profile

```http
GET /users/me
```

Get the current authenticated user's profile.

**Authentication:** Required

**Response:**
```json
{
  "id": "user-id",
  "username": "username",
  "displayName": "Display Name",
  "email": "user@example.com",
  "bio": "User bio",
  "image": "https://...",
  "bannerUrl": "https://...",
  "role": "USER",
  "badges": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Update My Profile

```http
PATCH /users/me
```

Update the current user's profile.

**Authentication:** Required

**Request Body:** (all fields optional)
```json
{
  "displayName": "New Display Name",
  "bio": "Updated bio",
  "location": "City, Country",
  "website": "https://example.com"
}
```

---

### Upload Profile Image

```http
POST /users/me/image
```

Upload a profile image.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file) - Image file (PNG, JPG, WEBP)

**Response:**
```json
{
  "imageUrl": "https://cdn.orbis.place/profile-images/..."
}
```

---

### Delete Profile Image

```http
DELETE /users/me/image
```

Delete the profile image (reverts to default).

**Authentication:** Required

---

### Upload Profile Banner

```http
POST /users/me/banner
```

Upload a profile banner.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `banner` (file) - Image file (PNG, JPG, WEBP)

---

### Delete Profile Banner

```http
DELETE /users/me/banner
```

Delete the profile banner.

**Authentication:** Required

---

### Get My Servers

```http
GET /users/me/servers
```

Get all servers owned by the current user.

**Authentication:** Required

**Response:**
```json
{
  "servers": [...]
}
```

---

## User Lookup

### Get User by Username

```http
GET /users/username/:username
```

Get a user's public profile by username.

**Authentication:** Optional

**URL Parameters:**
- `username` (string) - Username

**Response:**
```json
{
  "id": "user-id",
  "username": "username",
  "displayName": "Display Name",
  "bio": "User bio",
  "image": "https://...",
  "bannerUrl": "https://...",
  "badges": [...],
  "socialLinks": [...],
  "followerCount": 50,
  "followingCount": 30,
  "isFollowing": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Get User by ID

```http
GET /users/:userId
```

Get a user's public profile by ID.

**Authentication:** Not required

**URL Parameters:**
- `userId` (string) - User ID

**Response:** Same as get by username

---

### Search Users

```http
GET /users/search
```

Search for users by username or display name.

**Authentication:** Required

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, optional) - Maximum results (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      "image": "https://...",
      "badges": [...]
    }
  ]
}
```

---

## Following System

### Follow User

```http
POST /users/:userId/follow
```

Follow a user.

**Authentication:** Required

**URL Parameters:**
- `userId` (string) - User ID to follow

**Response:**
```json
{
  "message": "User followed successfully",
  "followerCount": 51
}
```

---

### Unfollow User

```http
DELETE /users/:userId/follow
```

Unfollow a user.

**Authentication:** Required

**URL Parameters:**
- `userId` (string) - User ID to unfollow

**Response:**
```json
{
  "message": "User unfollowed successfully",
  "followerCount": 50
}
```

---

### Get User Followers

```http
GET /users/:userId/followers
```

Get a list of users following this user.

> [!IMPORTANT]
> **Privacy Restriction**: You can only view your own followers list. This endpoint requires authentication and will return a 403 Forbidden error if you try to access another user's followers.

**Authentication:** Required

**URL Parameters:**
- `userId` (string) - User ID (must match authenticated user's ID)

**Response:**
```json
[
  {
    "id": "follower-id",
    "username": "follower",
    "displayName": "Follower Name",
    "image": "https://...",
    "bio": "Follower bio",
    "followedAt": "2024-01-01T00:00:00Z",
    "_count": {
      "followers": 10,
      "following": 15
    }
  }
]
```

**Error Responses:**

401 Unauthorized (not authenticated):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

403 Forbidden (trying to view another user's followers):
```json
{
  "statusCode": 403,
  "message": "You can only view your own followers list"
}
```

---

### Get User Following

```http
GET /users/:userId/following
```

Get a list of users that this user is following.

> [!IMPORTANT]
> **Privacy Restriction**: You can only view your own following list. This endpoint requires authentication and will return a 403 Forbidden error if you try to access another user's following list.

**Authentication:** Required

**URL Parameters:**
- `userId` (string) - User ID (must match authenticated user's ID)

**Response:**
```json
[
  {
    "id": "user-id",
    "username": "username",
    "displayName": "Display Name",
    "image": "https://...",
    "bio": "User bio",
    "followedAt": "2024-01-01T00:00:00Z",
    "_count": {
      "followers": 20,
      "following": 30
    }
  }
]
```

**Error Responses:**

401 Unauthorized (not authenticated):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

403 Forbidden (trying to view another user's following):
```json
{
  "statusCode": 403,
  "message": "You can only view your own following list"
}
```

---

## Social Links

### Get My Social Links

```http
GET /users/me/social-links
```

Get the current user's social links.

**Authentication:** Required

**Response:**
```json
{
  "socialLinks": [
    {
      "id": "link-id",
      "platform": "TWITTER",
      "url": "https://twitter.com/username",
      "order": 0
    }
  ]
}
```

**Platforms:** `TWITTER`, `YOUTUBE`, `TWITCH`, `GITHUB`, `DISCORD`, `WEBSITE`, `OTHER`

---

### Create Social Link

```http
POST /users/me/social-links
```

Add a social link to your profile.

**Authentication:** Required

**Request Body:**
```json
{
  "platform": "TWITTER",
  "url": "https://twitter.com/username"
}
```

**Response:**
```json
{
  "id": "link-id",
  "platform": "TWITTER",
  "url": "https://twitter.com/username",
  "order": 0
}
```

---

### Update Social Link

```http
PATCH /users/me/social-links/:id
```

Update a social link.

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Social link ID

**Request Body:**
```json
{
  "platform": "TWITTER",
  "url": "https://twitter.com/new-username"
}
```

---

### Delete Social Link

```http
DELETE /users/me/social-links/:id
```

Delete a social link.

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Social link ID

---

### Reorder Social Links

```http
PATCH /users/me/social-links/reorder
```

Reorder social links on your profile.

**Authentication:** Required

**Request Body:**
```json
{
  "linkIds": ["link-id-1", "link-id-2", "link-id-3"]
}
```

**Response:**
```json
{
  "message": "Social links reordered successfully"
}
```
