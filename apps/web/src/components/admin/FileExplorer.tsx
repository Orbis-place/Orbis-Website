import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileEntry {
    name: string;
    isDirectory: boolean;
    size: number;
    path: string;
}

interface FileExplorerProps {
    files: FileEntry[];
    onSelectFile: (path: string) => void;
    selectedFile?: string;
    loading?: boolean;
}

export function FileExplorer({ files, onSelectFile, selectedFile, loading }: FileExplorerProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-secondary/20 rounded-lg border border-border/30">
                <Icon ssr={true} icon="mdi:loading" className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!files || files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 rounded-lg border border-border/30 text-muted-foreground">
                <Icon ssr={true} icon="mdi:file-question" className="w-8 h-8 mb-2 opacity-50" />
                <p>No files found</p>
            </div>
        );
    }

    // Sort files: directories first, then alphabetical
    const sortedFiles = [...files].sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
    });

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename: string, isDirectory: boolean) => {
        if (isDirectory) return 'mdi:folder';
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'json':
            case 'yml':
            case 'yaml':
            case 'xml':
                return 'mdi:code-json';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return 'mdi:image';
            case 'md':
            case 'txt':
                return 'mdi:file-document-outline';
            case 'jar':
            case 'zip':
                return 'mdi:archive';
            case 'class':
                return 'mdi:language-java';
            default:
                return 'mdi:file-outline';
        }
    };

    return (
        <div className="border border-border/30 rounded-lg overflow-hidden bg-background">
            <div className="bg-secondary/30 px-4 py-2 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-hebden text-sm font-semibold">File Explorer</h3>
                <span className="text-xs text-muted-foreground">{files.length} items</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-1">
                {sortedFiles.map((file) => (
                    <button
                        key={file.path}
                        onClick={() => !file.isDirectory && onSelectFile(file.path)}
                        disabled={file.isDirectory}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group",
                            selectedFile === file.path
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-secondary/50 text-foreground",
                            file.isDirectory && "opacity-80 cursor-default"
                        )}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Icon ssr={true} icon={getFileIcon(file.name, file.isDirectory)}
                                className={cn(
                                    "w-4 h-4 flex-shrink-0",
                                    file.isDirectory ? "text-amber-400" : "text-muted-foreground",
                                    selectedFile === file.path && !file.isDirectory && "text-primary"
                                )}
                            />
                            <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2 font-mono flex-shrink-0 group-hover:text-foreground/70">
                            {formatSize(file.size)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
