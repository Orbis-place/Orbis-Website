---
title: Badges
description: API reference for user badges and achievements
---

Manage and award badges to users for achievements and recognition.

## Base Endpoint

All badge endpoints are prefixed with `/badges`

---

## Public Endpoints

### Get All Badges

```http
GET /badges
```

Get all badges.

**Authentication:** Not required

**Query Parameters:**
- `isActive` (boolean, optional) - Filter by active status

**Response:**
```json
{
  "badges": [
    {
      "id": "badge-id",
      "name": "Early Adopter",
      "slug": "early-adopter",
      "description": "Joined during beta",
      "iconUrl": "https://...",
      "color": "#FF5733",
      "isActive": true,
      "awardedCount": 150,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Badge by ID

```http
GET /badges/:badgeId
```

Get a specific badge by ID.

**Authentication:** Not required

**URL Parameters:**
- `badgeId` (string) - Badge ID

**Response:**
```json
{
  "id": "badge-id",
  "name": "Early Adopter",
  "slug": "early-adopter",
  "description": "Joined during beta",
  "iconUrl": "https://...",
  "color": "#FF5733",
  "isActive": true,
  "awardedCount": 150
}
```

---

### Get Badge by Slug

```http
GET /badges/slug/:slug
```

Get a badge by its unique slug.

**Authentication:** Not required

**URL Parameters:**
- `slug` (string) - Badge slug

**Response:** Same as get by ID

---

### Get User Badges

```http
GET /badges/users/:userId
```

Get all badges awarded to a specific user.

**Authentication:** Not required

**URL Parameters:**
- `userId` (string) - User ID

**Response:**
```json
{
  "badges": [
    {
      "id": "badge-id",
      "name": "Early Adopter",
      "slug": "early-adopter",
      "description": "Joined during beta",
      "iconUrl": "https://...",
      "color": "#FF5733",
      "awardedAt": "2024-01-05T00:00:00Z",
      "awardedBy": {
        "id": "admin-id",
        "username": "admin"
      }
    }
  ]
}
```

---

## Admin Endpoints

### Create Badge

```http
POST /badges
```

Create a new badge.

**Authentication:** Required (Admin or Super Admin)

**Request Body:**
```json
{
  "name": "Contributor",
  "slug": "contributor",
  "description": "Contributed code to the project",
  "iconUrl": "https://...",
  "color": "#4CAF50",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "badge-id",
  "name": "Contributor",
  "slug": "contributor",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Update Badge

```http
PATCH /badges/:badgeId
```

Update a badge.

**Authentication:** Required (Admin or Super Admin)

**URL Parameters:**
- `badgeId` (string) - Badge ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "color": "#FF5733",
  "isActive": false
}
```

---

### Delete Badge

```http
DELETE /badges/:badgeId
```

Delete a badge.

**Authentication:** Required (Admin or Super Admin)

**URL Parameters:**
- `badgeId` (string) - Badge ID

**Note:** Deleting a badge also removes it from all users who have been awarded it.

---

## Moderator Endpoints

### Award Badge

```http
POST /badges/award
```

Award a badge to a user.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**Request Body:**
```json
{
  "badgeId": "badge-id",
  "userId": "user-id",
  "reason": "Optional reason for awarding"
}
```

**Response:**
```json
{
  "message": "Badge awarded successfully",
  "userBadge": {
    "id": "user-badge-id",
    "userId": "user-id",
    "badgeId": "badge-id",
    "awardedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Revoke Badge

```http
DELETE /badges/:badgeId/users/:userId
```

Revoke a badge from a user.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `badgeId` (string) - Badge ID
- `userId` (string) - User ID

**Response:**
```json
{
  "message": "Badge revoked successfully"
}
```
