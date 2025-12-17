---
title: Resource Description Images
description: API reference for managing images in resource descriptions
---

Manage images used within resource descriptions. These images are uploaded separately and can be embedded in the resource description using markdown.

## Base Endpoint

All description image endpoints are prefixed with `/resources/description-images`

---

## Upload Description Image

```http
POST /resources/description-images/:resourceId/upload
```

Upload an image to use in a resource description. Images are temporary until the resource is saved.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Form Data:**
- `file` (file) - Image file (PNG, JPG, WEBP, GIF)

**Response:**
```json
{
  "id": "image-id",
  "url": "https://cdn.orbis.place/description-images/...",
  "fileName": "my-image.png",
  "fileSize": 524288,
  "isTemporary": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Notes:**
- Maximum 20 temporary images per user
- If the same image was already uploaded (same hash), returns the existing URL
- Images become permanent when the resource description is saved with the image URL
- Temporary images are automatically cleaned up after 7 days if not used

**Usage in Markdown:**
```markdown
![Alt text](https://cdn.orbis.place/description-images/...)
```

---

## Get Temporary Images

```http
GET /resources/description-images/:resourceId/temporary
```

Get all temporary images uploaded for a specific resource by the current user.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "images": [
    {
      "id": "image-id",
      "url": "https://cdn.orbis.place/description-images/...",
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
DELETE /resources/description-images/:resourceId/:imageId
```

Delete a temporary image that hasn't been used yet.

**Authentication:** Required

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `imageId` (string) - Image ID

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

**Notes:**
- Can only delete images that are not currently used in a resource description
- Only the user who uploaded the image can delete it
