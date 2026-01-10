import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { VersionChangelogImageService } from './version-changelog-image.service';

@ApiTags('resources/versions/changelog-images')
@ApiBearerAuth()
@Controller('resources/versions')
export class VersionChangelogImageController {
    constructor(private readonly changelogImageService: VersionChangelogImageService) { }

    /**
     * Upload a changelog image (temporary)
     * If the same image was already uploaded, returns the existing URL instead
     */
    @Post(':versionId/changelog-images')
    @ApiOperation({
        summary: 'Upload a changelog image',
        description:
            'Uploads an image for use in version changelogs. Images are temporary by default and will be validated when the changelog is saved. Maximum 20 temporary images per user.',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Session() session: UserSession,
        @Param('versionId') versionId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.changelogImageService.uploadImage(session.user.id, versionId, file);
    }

    /**
     * Get all temporary images for a version
     */
    @Get(':versionId/changelog-images/temporary')
    @ApiOperation({
        summary: 'Get all temporary images for a version',
        description: 'Retrieves all temporary images uploaded for a specific version changelog by the current user.',
    })
    async getTemporaryImages(
        @Session() session: UserSession,
        @Param('versionId') versionId: string,
    ) {
        return this.changelogImageService.getTemporaryImages(session.user.id, versionId);
    }

    /**
     * Delete a temporary image
     */
    @Delete(':versionId/changelog-images/:imageId')
    @ApiOperation({
        summary: 'Delete a temporary image',
        description: 'Deletes a temporary image that has not yet been used in a changelog.',
    })
    async deleteTemporaryImage(
        @Session() session: UserSession,
        @Param('versionId') versionId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.changelogImageService.deleteTemporaryImage(session.user.id, versionId, imageId);
    }
}
