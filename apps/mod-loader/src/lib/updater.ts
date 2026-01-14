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
 * Vérifie si une mise à jour est disponible
 * @returns Statut de la mise à jour
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
        console.error('Erreur lors de la vérification des mises à jour:', error);
        return { available: false };
    }
}

/**
 * Télécharge et installe une mise à jour
 * @param onProgress Callback pour suivre la progression du téléchargement
 * @returns true si la mise à jour a été installée avec succès
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
                    console.log(`Téléchargement démarré: ${contentLength} bytes`);
                    break;
                case 'Progress':
                    downloaded += event.data.chunkLength;
                    onProgress?.(downloaded, contentLength);
                    console.log(`Téléchargé: ${downloaded}/${contentLength} bytes`);
                    break;
                case 'Finished':
                    console.log('Téléchargement terminé');
                    break;
            }
        });

        console.log('Mise à jour installée avec succès');

        // Redémarrer l'application
        await relaunch();

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'installation de la mise à jour:', error);
        return false;
    }
}
