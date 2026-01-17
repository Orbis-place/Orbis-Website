/**
 * API client for image uploads in resource descriptions
 *
 * This module provides functions to upload images to the server
 * for use in resource descriptions.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface UploadImageResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

/**
 * Upload an image for a resource description
 *
 * @param resourceId - The ID of the resource
 * @param file - The image file to upload
 * @returns The uploaded image URL
 *
 * @example
 * ```ts
 * const file = new File(['...'], 'image.png', { type: 'image/png' })
 * const result = await uploadResourceDescriptionImage('resource-123', file)
 * console.log(result.url) // https://cdn.orbis.com/images/abc123.png
 * ```
 */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadResourceDescriptionImage(
  resourceId: string,
  file: File,
  options?: { maxSize?: number }
): Promise<UploadImageResponse> {
  // Validation de la taille du fichier
  const maxSize = options?.maxSize || DEFAULT_MAX_SIZE
  if (file.size > maxSize) {
    throw new Error(`Image size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
  }

  // Validation du type de fichier
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Préparation de la requête
  const formData = new FormData()
  formData.append('file', file)

  // Upload vers l'endpoint du backend avec resourceId dans le path
  const response = await fetch(`${API_URL}/resources/description-images/${resourceId}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload image' }))
    throw new Error(error.message || `Upload failed with status ${response.status}`)
  }

  const data = await response.json()

  // Le backend renvoie { image: { url, ... } }
  const imageData = data.image
  if (!imageData?.url) {
    throw new Error('Invalid response from server: missing image URL')
  }

  return {
    url: imageData.url,
    filename: imageData.storageKey || file.name,
    size: imageData.size || file.size,
    mimeType: file.type
  }
}

/**
 * Upload an image for a server description
 *
 * @param serverId - The ID of the server
 * @param file - The image file to upload
 * @returns The uploaded image URL
 *
 * @example
 * ```ts
 * const file = new File(['...'], 'image.png', { type: 'image/png' })
 * const result = await uploadServerDescriptionImage('server-123', file)
 * console.log(result.url) // https://cdn.orbis.com/images/abc123.png
 * ```
 */
export async function uploadServerDescriptionImage(
  serverId: string,
  file: File,
  options?: { maxSize?: number }
): Promise<UploadImageResponse> {
  // Validation de la taille du fichier
  const maxSize = options?.maxSize || DEFAULT_MAX_SIZE
  if (file.size > maxSize) {
    throw new Error(`Image size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
  }

  // Validation du type de fichier
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Préparation de la requête
  const formData = new FormData()
  formData.append('file', file)

  // Upload vers l'endpoint du backend avec serverId dans le path
  const response = await fetch(`${API_URL}/servers/description-images/${serverId}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload image' }))
    throw new Error(error.message || `Upload failed with status ${response.status}`)
  }

  const data = await response.json()

  // Le backend renvoie { image: { url, ... } }
  const imageData = data.image
  if (!imageData?.url) {
    throw new Error('Invalid response from server: missing image URL')
  }

  return {
    url: imageData.url,
    filename: imageData.storageKey || file.name,
    size: imageData.size || file.size,
    mimeType: file.type
  }
}

/**
 * Upload an image for a version changelog
 *
 * @param versionId - The ID of the version
 * @param file - The image file to upload
 * @returns The uploaded image URL
 *
 * @example
 * ```ts
 * const file = new File(['...'], 'image.png', { type: 'image/png' })
 * const result = await uploadVersionChangelogImage('version-123', file)
 * console.log(result.url) // https://cdn.orbis.com/images/abc123.png
 * ```
 */
export async function uploadVersionChangelogImage(
  versionId: string,
  file: File,
  options?: { maxSize?: number }
): Promise<UploadImageResponse> {
  // Validation de la taille du fichier
  const maxSize = options?.maxSize || DEFAULT_MAX_SIZE
  if (file.size > maxSize) {
    throw new Error(`Image size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`)
  }

  // Validation du type de fichier
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Préparation de la requête
  const formData = new FormData()
  formData.append('file', file)

  // Upload vers l'endpoint du backend avec versionId dans le path
  const response = await fetch(`${API_URL}/resources/versions/${versionId}/changelog-images`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to upload image' }))
    throw new Error(error.message || `Upload failed with status ${response.status}`)
  }

  const data = await response.json()

  // Le backend renvoie { image: { url, ... } }
  const imageData = data.image
  if (!imageData?.url) {
    throw new Error('Invalid response from server: missing image URL')
  }

  return {
    url: imageData.url,
    filename: imageData.storageKey || file.name,
    size: imageData.size || file.size,
    mimeType: file.type
  }
}

/**
 * Delete an image from a resource description
 *
 * @param resourceId - The ID of the resource
 * @param imageUrl - The URL of the image to delete
 *
 * @example
 * ```ts
 * await deleteResourceDescriptionImage('resource-123', 'https://cdn.orbis.com/images/abc123.png')
 * ```
 */
export async function deleteResourceDescriptionImage(
  resourceId: string,
  imageUrl: string
): Promise<void> {
  // TODO: Adapter cette URL selon votre API backend
  const response = await fetch(`${API_URL}/resources/${resourceId}/description-images`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete image' }))
    throw new Error(error.message || `Delete failed with status ${response.status}`)
  }
}

/**
 * Convert a File to a base64 data URL
 * Useful for preview before upload
 *
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Validate if a URL is a base64 image data URL
 *
 * @param url - The URL to validate
 * @returns true if it's a base64 data URL
 */
export function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/')
}

/**
 * Get all image URLs from HTML content
 * Useful to track which images are used in a description
 *
 * @param html - The HTML content
 * @returns Array of image URLs found in the content
 */
export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const urls: string[] = []
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1])
    }
  }

  return urls
}
