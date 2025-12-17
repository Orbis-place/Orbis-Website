---
title: Resource Gallery Images
description: API reference for managing resource gallery images
---

Manage gallery images for marketplace resources to showcase your content.

## Base Endpoint

All gallery image endpoints are prefixed with `/resources/:resourceId/gallery-images`

---

## Add Gallery Image

```http
POST /resources/:resourceId/gallery-images
```

Add an image to the resource gallery.

**Authentication:** Required (must be owner or contributor)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Form Data:**
- `image` (file) - Image file (PNG, JPG, WEBP)
- `caption` (string, optional) - Image caption
- `altText` (string, optional) - Alt text for accessibility

**Response:**
```json
{
  "id": "image-id",
  "resourceId": "resource-id",
  "imageUrl": "https://...",
  "caption": "Screenshot of the mod in action",
  "altText": "Mod interface screenshot",
  "order": 0,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Get Gallery Images

```http
GET /resources/:resourceId/gallery-images
```

Get all gallery images for a resource.

**Authentication:** Not required

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Response:**
```json
{
  "images": [
    {
      "id": "image-id",
      "imageUrl": "https://...",
      "thumbnailUrl": "https://...",
      "caption": "Screenshot",
      "altText": "Alt text",
      "order": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Get Gallery Image

```http
GET /resources/:resourceId/gallery-images/:imageId
```

Get a specific gallery image.

**Authentication:** Not required

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `imageId` (string) - Image ID

**Response:**
```json
{
  "id": "image-id",
  "imageUrl": "https://...",
  "caption": "Screenshot",
  "altText": "Alt text",
  "order": 0
}
```

---

## Update Gallery Image

```http
PATCH /resources/:resourceId/gallery-images/:imageId
```

Update gallery image details (caption, alt text).

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `imageId` (string) - Image ID

**Request Body:**
```json
{
  "caption": "Updated caption",
  "altText": "Updated alt text"
}
```

---

## Replace Gallery Image

```http
POST /resources/:resourceId/gallery-images/:imageId/replace
```

Replace the image file while keeping the same gallery position and metadata.

**Authentication:** Required (must be owner or contributor)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `imageId` (string) - Image ID

**Form Data:**
- `image` (file) - New image file

**Response:**
```json
{
  "id": "image-id",
  "imageUrl": "https://new-url...",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Reorder Gallery Images

```http
PUT /resources/:resourceId/gallery-images/reorder
```

Reorder gallery images by specifying the new order.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID

**Request Body:**
```json
{
  "imageIds": ["image-id-1", "image-id-2", "image-id-3"]
}
```

**Response:**
```json
{
  "message": "Gallery images reordered successfully"
}
```

---

## Delete Gallery Image

```http
DELETE /resources/:resourceId/gallery-images/:imageId
```

Delete a gallery image.

**Authentication:** Required (must be owner or contributor)

**URL Parameters:**
- `resourceId` (string) - Resource ID
- `imageId` (string) - Image ID

**Response:**
```json
{
  "message": "Gallery image deleted successfully"
}
```
