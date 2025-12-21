// Files Store - Virtual file system for server files
import { writable, get } from 'svelte/store';
import { type FileNode, type Backup, MOCK_FILES, MOCK_BACKUPS } from './mockData';

function createFilesStore() {
    const { subscribe, set, update } = writable<Record<string, FileNode>>(MOCK_FILES);

    return {
        subscribe,

        getServerFiles: (serverId: string): FileNode | null => {
            return get({ subscribe })[serverId] || null;
        },

        getAtPath: (serverId: string, path: string): FileNode | null => {
            const root = get({ subscribe })[serverId];
            if (!root) return null;
            if (path === '/') return root;

            const parts = path.split('/').filter(Boolean);
            let current: FileNode | undefined = root;

            for (const part of parts) {
                current = current?.children?.find(c => c.name === part);
                if (!current) return null;
            }
            return current;
        },

        getFileContent: (serverId: string, path: string): string | null => {
            const node = createFilesStore().getAtPath(serverId, path);
            if (node?.type === 'file') {
                return node.content || `// Content of ${path}`;
            }
            return null;
        },

        saveFileContent: (serverId: string, path: string, content: string) => {
            update(files => {
                const root = files[serverId];
                if (!root) return files;

                const parts = path.split('/').filter(Boolean);
                let current: FileNode = root;

                for (let i = 0; i < parts.length - 1; i++) {
                    const child = current.children?.find(c => c.name === parts[i]);
                    if (!child) return files;
                    current = child;
                }

                const file = current.children?.find(c => c.name === parts[parts.length - 1]);
                if (file?.type === 'file') {
                    file.content = content;
                    file.modifiedAt = new Date();
                    file.size = content.length;
                }
                return { ...files };
            });
        },

        initializeForServer: (serverId: string, serverName: string) => {
            update(files => ({
                ...files,
                [serverId]: {
                    name: serverName,
                    path: '/',
                    type: 'directory',
                    children: [
                        { name: 'config', path: '/config', type: 'directory', children: [] },
                        { name: 'worlds', path: '/worlds', type: 'directory', children: [] },
                        { name: 'mods', path: '/mods', type: 'directory', children: [] },
                        { name: 'logs', path: '/logs', type: 'directory', children: [] },
                    ],
                },
            }));
        },

        reset: () => set(MOCK_FILES),
    };
}

export const files = createFilesStore();

// Backups store
function createBackupsStore() {
    const { subscribe, set, update } = writable<Backup[]>(MOCK_BACKUPS);

    return {
        subscribe,

        getForServer: (serverId: string): Backup[] => {
            return get({ subscribe }).filter(b => b.serverId === serverId);
        },

        create: (serverId: string, name: string, type: Backup['type'] = 'full') => {
            const sizes = { full: '1.2 GB', worlds: '850 MB', config: '12 KB' };
            const backup: Backup = {
                id: `bkp-${Date.now()}`,
                serverId,
                name,
                createdAt: new Date(),
                size: sizes[type],
                type,
            };
            update(backups => [backup, ...backups]);
            return backup.id;
        },

        delete: (id: string) => {
            update(backups => backups.filter(b => b.id !== id));
        },

        restore: (id: string) => {
            console.log(`Restoring backup ${id}...`);
            return true;
        },

        reset: () => set(MOCK_BACKUPS),
    };
}

export const backups = createBackupsStore();
