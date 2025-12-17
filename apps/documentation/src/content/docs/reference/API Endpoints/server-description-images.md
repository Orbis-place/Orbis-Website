---
title: Server Description Images
description: API reference for managing images in server descriptions
---

Manage images used within server descriptions. These images are uploaded separately and can be embedded in the server description using markdown.

## Base Endpoint

All description image endpoints are prefixed with `/servers/description-images`

---

## Upload Description Image

```http
POST /servers/description-images/:serverId/upload
```

Upload an image to use in a server description. Images are temporary until the server is saved.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `serverId` (string) - Server ID

**Form Data:**
- `file` (file) - Image file (PNG, JPG, WEBP, GIF)

**Response:**
```json
{
  "id": "image-id",
  "url": "https://cdn.orbis.place/server-description-images/...",
  "fileName": "screenshot.png",
  "fileSize": 524288,
  "isTemporary": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Notes:**
- Maximum 20 temporary images per user
- If the same image was already uploaded (same hash), returns the existing URL
- Images become permanent when the server description is saved with the image URL
- Temporary images are automatically cleaned up after 7 days if not used

**Usage in Markdown:**
```markdown
![Server spawn area](https://cdn.orbis.place/server-description-images/...)
```

---

## Get Temporary Images

```http
GET /servers/description-images/:serverId/temporary
```

Get all temporary images uploaded for a specific server by the current user.

**Authentication:** Required

**URL Parameters:**
- `serverId` (string) - Server ID

**Response:**
```json
{
  "images": [
    {
      "id": "image-id",
      "url": "https://cdn.orbis.place/server-description-images/...",
      "fileName": "screenshot.png",
      "fileSize": 524288,
      "isTemporary": true,
      "isUsed": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Delete Temporary Image

```http
DELETE /servers/description-images/:serverId/:imageId
```

Delete a temporary image that hasn't been used yet.

**Authentication:** Required

**URL Parameters:**
- `serverId` (string) - Server ID
- `imageId` (string) - Image ID

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

**Notes:**
- Can only delete images that are not currently used in a server description
- Only the user who uploaded the image can delete it
