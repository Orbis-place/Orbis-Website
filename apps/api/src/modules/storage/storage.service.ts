import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
        const extension = file.originalname.split('.').pop();
        const filename = `${folder}/${createId()}.${extension}`;

        const safeOriginalName = file.originalname.replace(/"/g, '');

        if (file.size < 5 * 1024 * 1024) {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.publicBucket,
                Key: filename,
                Body: file.buffer,
                ContentType: file.mimetype,
                CacheControl: 'public, max-age=31536000',
                ContentDisposition: `attachment; filename="${safeOriginalName}"`,
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
                    ContentDisposition: `attachment; filename="${safeOriginalName}"`,
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
}