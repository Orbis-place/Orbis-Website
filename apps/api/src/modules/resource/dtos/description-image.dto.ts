import { ApiProperty } from '@nestjs/swagger';

export class UploadDescriptionImageDto {
    @ApiProperty({ description: 'Image file', type: 'string', format: 'binary' })
    file: Express.Multer.File;
}

export class DescriptionImageResponseDto {
    @ApiProperty({ description: 'Image ID' })
    id: string;

    @ApiProperty({ description: 'Image URL' })
    url: string;

    @ApiProperty({ description: 'Storage key' })
    storageKey: string;

    @ApiProperty({ description: 'Image status', enum: ['TEMPORARY', 'PERMANENT', 'ORPHANED'] })
    status: string;

    @ApiProperty({ description: 'Upload date' })
    uploadedAt: Date;

    @ApiProperty({ description: 'File size in bytes' })
    size: number;
}