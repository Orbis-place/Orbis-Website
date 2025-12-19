import sharp from 'sharp';

/**
 * Fetches an image from a URL and converts it to a base64 PNG data URI.
 * This is needed because Satori (used by Next.js for OG images) doesn't support WebP.
 * @param url - The URL of the image to fetch
 * @returns A base64 PNG data URI or null if conversion fails
 */
export async function fetchImageAsBase64Png(url: string): Promise<string | null> {
    try {
        // Clean URL from encoded spaces
        const cleanUrl = url.replace(/%20/g, '').replace(/\s/g, '');

        const response = await fetch(cleanUrl);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to PNG using sharp
        const pngBuffer = await sharp(buffer).png().toBuffer();

        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Failed to convert image:', error);
        return null;
    }
}
