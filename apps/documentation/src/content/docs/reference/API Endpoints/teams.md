---
title: Teams
description: Complete API reference for Teams endpoints
---

Manage teams, team members, invitations, and team-owned content.

## Base Endpoint

All team endpoints are prefixed with `/teams`

---

## Team Management

### Get All Teams

```http
GET /teams
```

Get all teams with optional filters.

**Authentication:** Not required

**Query Parameters:**
- `search` (string, optional) - Search query for team name
- `limit` (number, optional) - Results per page
- `offset` (number, optional) - Pagination offset

**Response:**
```json
{
  "teams": [
    {
      "id": "team-id",
      "name": "My Team",
      "slug": "my-team",
      "description": "Team description",
      "logoUrl": "https://...",
      "bannerUrl": "https://...",
      "memberCount": 5,
      "resourceCount": 10,
      "serverCount": 2
    }
  ],
  "total": 50
}
```

---

### Get Team by Slug

```http
GET /teams/slug/:slug
```

Get a team by its unique slug.

**Authentication:** Not required

**URL Parameters:**
- `slug` (string) - Team slug

**Response:**
```json
{
  "id": "team-id",
  "name": "My Team",
  "slug": "my-team",
  "description": "Full team description",
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "members": [...],
  "socialLinks": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Create Team

```http
POST /teams
```

Create a new team.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Team",
  "slug": "my-team",
  "description": "Team description"
}
```

**Response:**
```json
{
  "id": "team-id",
  "name": "My Team",
  "slug": "my-team",
  "ownerId": "user-id",
  "members": [
    {
      "userId": "user-id",
      "role": "OWNER"
    }
  ]
}
```

---

### Update Team

```http
PATCH /teams/:id
```

Update team details.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

---

### Delete Team

```http
DELETE /teams/:id
```

Delete a team.

**Authentication:** Required (must be owner)

**URL Parameters:**
- `id` (string) - Team ID

---

## Team Assets

### Upload Team Logo

```http
POST /teams/:id/logo
```

Upload a logo for the team.

**Authentication:** Required (must be owner or admin)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (string) - Team ID

**Form Data:**
- `logo` (file) - Image file (PNG, JPG, WEBP)

---

### Upload Team Banner

```http
POST /teams/:id/banner
```

Upload a banner for the team.

**Authentication:** Required (must be owner or admin)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (string) - Team ID

**Form Data:**
- `banner` (file) - Image file (PNG, JPG, WEBP)

---

### Delete Team Logo

```http
DELETE /teams/:id/logo
```

Delete the team logo.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

---

### Delete Team Banner

```http
DELETE /teams/:id/banner
```

Delete the team banner.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

---

## Invitations

### Create Invitation

```http
POST /teams/:id/invitations
```

Invite a user to join the team.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

**Request Body:**
```json
{
  "userId": "user-id-to-invite",
  "role": "MEMBER"
}
```

**Roles:** `MEMBER`, `MODERATOR`, `ADMIN`

**Response:**
```json
{
  "id": "invitation-id",
  "teamId": "team-id",
  "userId": "user-id",
  "role": "MEMBER",
  "status": "PENDING",
  "expiresAt": "2024-01-08T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Get Team Invitations

```http
GET /teams/:id/invitations
```

Get all invitations for a team.

**Authentication:** Required (must be team member)

**URL Parameters:**
- `id` (string) - Team ID

**Query Parameters:**
- `status` (string, optional) - Filter by status (PENDING, ACCEPTED, DECLINED, CANCELLED)

**Response:**
```json
{
  "invitations": [
    {
      "id": "invitation-id",
      "user": {
        "id": "user-id",
        "username": "username",
        "displayName": "Display Name"
      },
      "role": "MEMBER",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-08T00:00:00Z"
    }
  ]
}
```

---

### Cancel Invitation

```http
DELETE /teams/:id/invitations/:invitationId
```

Cancel a pending invitation.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID
- `invitationId` (string) - Invitation ID

---

### Get User Invitations

```http
GET /teams/invitations/me
```

Get all team invitations for the current user.

**Authentication:** Required

**Query Parameters:**
- `status` (string, optional) - Filter by status

**Response:**
```json
{
  "invitations": [
    {
      "id": "invitation-id",
      "team": {
        "id": "team-id",
        "name": "Team Name",
        "slug": "team-slug",
        "logoUrl": "https://..."
      },
      "role": "MEMBER",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-08T00:00:00Z"
    }
  ]
}
```

---

### Respond to Invitation

```http
POST /teams/invitations/:invitationId/respond
```

Accept or decline a team invitation.

**Authentication:** Required

**URL Parameters:**
- `invitationId` (string) - Invitation ID

**Request Body:**
```json
{
  "accept": true
}
```

**Response:**
```json
{
  "message": "Invitation accepted",
  "teamMember": {
    "teamId": "team-id",
    "userId": "user-id",
    "role": "MEMBER"
  }
}
```

---

## Team Members

### Update Team Member

```http
PATCH /teams/:id/members/:memberId
```

Update a team member's role.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID
- `memberId` (string) - Team member ID

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Roles:** `MEMBER`, `MODERATOR`, `ADMIN`, `OWNER`

---

### Remove Team Member

```http
DELETE /teams/:id/members/:memberId
```

Remove a member from the team.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID
- `memberId` (string) - Team member ID

---

### Leave Team

```http
DELETE /teams/:id/leave
```

Leave a team you're a member of.

**Authentication:** Required

**URL Parameters:**
- `id` (string) - Team ID

**Note:** Team owners cannot leave their team without transferring ownership first.

---

## Team Content

### Get Team Resources

```http
GET /teams/:id/resources
```

Get all resources owned by a team.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Team ID

**Response:**
```json
{
  "resources": [...]
}
```

---

### Get Team Servers

```http
GET /teams/:id/servers
```

Get all servers owned by a team.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Team ID

**Response:**
```json
{
  "servers": [...]
}
```

---

### Get My Teams

```http
GET /teams/me
```

Get all teams the current user is a member of.

**Authentication:** Required

**Response:**
```json
{
  "teams": [
    {
      "id": "team-id",
      "name": "Team Name",
      "slug": "team-slug",
      "role": "ADMIN",
      "logoUrl": "https://..."
    }
  ]
}
```

---

## Social Links

### Get Team Social Links

```http
GET /teams/:id/social-links
```

Get all social links for a team.

**Authentication:** Not required

**URL Parameters:**
- `id` (string) - Team ID

---

### Create Social Link

```http
POST /teams/:id/social-links
```

Add a social link to a team.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

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
PATCH /teams/:id/social-links/:linkId
```

Update a social link.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID
- `linkId` (string) - Social link ID

---

### Delete Social Link

```http
DELETE /teams/:id/social-links/:linkId
```

Delete a social link.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID
- `linkId` (string) - Social link ID

---

### Reorder Social Links

```http
PATCH /teams/:id/social-links/reorder
```

Reorder social links.

**Authentication:** Required (must be owner or admin)

**URL Parameters:**
- `id` (string) - Team ID

**Request Body:**
```json
{
  "linkIds": ["link-id-1", "link-id-2"]
}
```
