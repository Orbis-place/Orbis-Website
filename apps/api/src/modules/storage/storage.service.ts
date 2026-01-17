import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { S3Client, DeleteObjectCommand, PutObjectCommand, CopyObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { Upload } from "@aws-sdk/lib-storage";
import { createId } from "@paralleldrive/cuid2";

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private readonly publicBucket: string;
    private readonly privateBucket: string;
    private readonly publicUrl: string;

    constructor(private configService: ConfigService) {
        const accountId = this.configService.get('R2_ACCOUNT_ID');
        const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.publicBucket = this.configService.get('R2_PUBLIC_BUCKET_NAME');
        this.privateBucket = this.configService.get('R2_PRIVATE_BUCKET_NAME');

        this.publicUrl = this.configService.get('R2_PUBLIC_URL') || `https://pub-xxx.r2.dev`;
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        console.log('upllll', file);
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${folder}/${createId()}-${safeOriginalName}`;

        const contentDispositionName = file.originalname.replace(/"/g, '');

        if (file.size < 5 * 1024 * 1024) {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.publicBucket,
                Key: filename,
                Body: file.buffer,
                ContentType: file.mimetype,
                CacheControl: 'public, max-age=31536000',
                ContentDisposition: `attachment; filename="${contentDispositionName}"`,
            }));
        } else {
            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.publicBucket,
                    Key: filename,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    CacheControl: 'public, max-age=31536000',
                    ContentDisposition: `attachment; filename="${contentDispositionName}"`,
                },
            });

            await upload.done();
        }

        return `${this.publicUrl}/${filename}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const filename = fileUrl.split(`${this.publicUrl}/`)[1];
        if (!filename) return;

        await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.publicBucket,
            Key: filename,
        }));
    }

    async copyFile(sourceUrl: string, destinationKey: string): Promise<string> {
        const sourceKey = sourceUrl.split(`${this.publicUrl}/`)[1];
        if (!sourceKey) {
            throw new Error('Invalid source URL');
        }

        await this.s3Client.send(new CopyObjectCommand({
            Bucket: this.publicBucket,
            CopySource: `${this.publicBucket}/${sourceKey}`,
            Key: destinationKey,
        }));

        return `${this.publicUrl}/${destinationKey}`;
    }

    async getFileStream(fileUrl: string): Promise<Readable> {
        const key = fileUrl.split(`${this.publicUrl}/`)[1];
        if (!key) {
            throw new Error('Invalid file URL');
        }

        const command = new GetObjectCommand({
            Bucket: this.publicBucket,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        return response.Body as Readable;
    }

    async uploadStream(
        stream: Readable | Buffer,
        folder: string,
        filename: string,
        mimeType: string = 'application/octet-stream'
    ): Promise<string> {
        const fullKey = `${folder}/${createId()}-${filename}`;

        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket: this.publicBucket,
                Key: fullKey,
                Body: stream,
                ContentType: mimeType,
                CacheControl: 'public, max-age=31536000',
            },
        });

        await upload.done();
        return `${this.publicUrl}/${fullKey}`;
    }
}