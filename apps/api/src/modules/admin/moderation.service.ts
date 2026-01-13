import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

@Injectable()
export class ModerationService {
    private readonly vtApiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly storageService: StorageService,
    ) {
        this.vtApiKey = this.configService.get('VIRUSTOTAL_API_KEY');
    }

    // ============================================
    // FILE INSPECTION
    // ============================================

    async getFileStructure(versionId: string, fileUrl: string) {
        // Download file buffer
        const buffer = await this.downloadFile(fileUrl);
        const filename = fileUrl.split('/').pop();
        const extension = filename?.split('.').pop()?.toLowerCase();

        // If it's a zip/jar, list contents
        if (['zip', 'jar', 'war'].includes(extension || '')) {
            try {
                const zip = new AdmZip(buffer);
                const entries = zip.getEntries();

                return entries.map(entry => ({
                    name: entry.entryName,
                    isDirectory: entry.isDirectory,
                    size: entry.header.size,
                    path: entry.entryName,
                }));
            } catch (error) {
                console.error('Failed to read archive:', error);
                throw new BadRequestException('Failed to read archive file');
            }
        }

        // Single file
        return [{
            name: filename,
            isDirectory: false,
            size: buffer.length,
            path: filename,
        }];
    }

    async getFileContent(fileUrl: string, filePath: string) {
        const buffer = await this.downloadFile(fileUrl);
        const filename = fileUrl.split('/').pop();
        const extension = filename?.split('.').pop()?.toLowerCase();

        // If archive, extract specific file
        if (['zip', 'jar', 'war'].includes(extension || '')) {
            try {
                const zip = new AdmZip(buffer);
                const entry = zip.getEntry(filePath);

                if (!entry) {
                    throw new NotFoundException('File not found inside archive');
                }

                if (entry.isDirectory) {
                    throw new BadRequestException('Cannot read directory content');
                }

                // Check file extension of inner file
                const innerExt = filePath.split('.').pop()?.toLowerCase();
                if (['class', 'exe', 'dll', 'so', 'dylib'].includes(innerExt || '')) {
                    return { type: 'binary', content: null, message: 'Binary file content cannot be viewed' };
                }

                return { type: 'text', content: entry.getData().toString('utf8') };
            } catch (error) {
                if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
                console.error('Failed to read archive entry:', error);
                throw new BadRequestException('Failed to read archive entry');
            }
        }

        // Single file - check if binary
        if (['zip', 'jar', 'war', 'exe', 'dll'].includes(extension || '')) {
            return { type: 'binary', content: null, message: 'Binary file content cannot be viewed' };
        }

        return { type: 'text', content: buffer.toString('utf8') };
    }

    private async downloadFile(url: string): Promise<Buffer> {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to download file');
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.error('Download failed:', error);
            throw new BadRequestException('Failed to access file');
        }
    }

    // ============================================
    // VIRUSTOTAL SCANNING
    // ============================================

    async scanFile(fileUrl: string) {
        // Mock implementation if no key provided
        if (!this.vtApiKey) {
            console.log('[ModerationService] No VirusTotal key, using mock response');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const isClean = Math.random() > 0.1;

            return {
                scanId: 'mock-scan-' + Date.now(),
                status: 'completed',
                stats: {
                    malicious: isClean ? 0 : 2,
                    suspicious: isClean ? 0 : 1,
                    undetected: 60,
                    harmless: 10,
                    timeout: 0,
                },
                permalink: 'https://www.virustotal.com/gui/home/upload',
                mock: true
            };
        }

        console.log('sonqsjndazjdazjndqda')
        try {
            // 1. Download the file
            const buffer = await this.downloadFile(fileUrl);
            const filename = fileUrl.split('/').pop() || 'file';

            // 2. Upload to VirusTotal
            const analysisId = await this.uploadToVirusTotal(buffer, filename);

            return {
                scanId: analysisId,
                status: 'queued',
                mock: false
            };
        } catch (error) {
            console.error('[ModerationService] VirusTotal scan failed:', error);
            throw new BadRequestException('Failed to scan file with VirusTotal');
        }
    }

    async getScanAnalysis(analysisId: string) {
        if (!this.vtApiKey || analysisId.startsWith('mock-')) {
            return {
                status: 'completed',
                stats: { malicious: 0, suspicious: 0, harmless: 10, undetected: 60 },
                permalink: '#'
            };
        }

        const response = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
            {
                headers: {
                    'x-apikey': this.vtApiKey,
                },
            }
        );

        if (!response.ok) {
            throw new BadRequestException(`Failed to get analysis: ${response.status}`);
        }

        const data = await response.json();
        const status = data.data.attributes.status;
        const stats = data.data.attributes.stats;

        // Get file hash for permalink
        const sha256 = data.meta?.file_info?.sha256 || data.data.attributes.sha256;

        return {
            status,
            stats: {
                malicious: stats.malicious || 0,
                suspicious: stats.suspicious || 0,
                undetected: stats.undetected || 0,
                harmless: stats.harmless || 0,
                timeout: stats.timeout || 0,
            },
            permalink: sha256
                ? `https://www.virustotal.com/gui/file/${sha256}`
                : `https://www.virustotal.com/gui/home/upload`,
        };
    }

    private async uploadToVirusTotal(buffer: Buffer, filename: string): Promise<string> {
        const formData = new FormData();
        const blob = new Blob([buffer as any]);
        formData.append('file', blob, filename);

        const response = await fetch('https://www.virustotal.com/api/v3/files', {
            method: 'POST',
            headers: {
                'x-apikey': this.vtApiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[ModerationService] VT upload failed:', error);
            throw new Error(`VirusTotal upload failed: ${response.status}`);
        }

        const data = await response.json();
        return data.data.id; // analysis ID
    }
}
