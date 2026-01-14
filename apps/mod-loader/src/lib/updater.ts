import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateStatus {
    available: boolean;
    version?: string;
    currentVersion?: string;
    notes?: string;
    date?: string;
}

/**
 * Check if an update is available
 * @returns Update status
 */
export async function checkForUpdates(): Promise<UpdateStatus> {
    try {
        const update = await check();

        if (update?.available) {
            return {
                available: true,
                version: update.version,
                currentVersion: update.currentVersion,
                notes: update.body,
                date: update.date
            };
        }

        return { available: false };
    } catch (error) {
        console.error('Error checking for updates:', error);
        return { available: false };
    }
}

/**
 * Download and install an update
 * @param onProgress Callback to track download progress
 * @returns true if the update was successfully installed
 */
export async function downloadAndInstallUpdate(
    onProgress?: (downloaded: number, total: number) => void
): Promise<boolean> {
    try {
        const update = await check();

        if (!update?.available) {
            return false;
        }

        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
            switch (event.event) {
                case 'Started':
                    contentLength = event.data.contentLength;
                    console.log(`Download started: ${contentLength} bytes`);
                    break;
                case 'Progress':
                    downloaded += event.data.chunkLength;
                    onProgress?.(downloaded, contentLength);
                    console.log(`Downloaded: ${downloaded}/${contentLength} bytes`);
                    break;
                case 'Finished':
                    console.log('Download completed');
                    break;
            }
        });

        console.log('Update installed successfully');

        // Restart the application
        await relaunch();

        return true;
    } catch (error) {
        console.error('Error installing update:', error);
        return false;
    }
}
