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
import { ResourceDescriptionImageService } from './resource-description-image.service';
import { UploadDescriptionImageDto } from './dtos/description-image.dto';

@ApiTags('resources/description-images')
@ApiBearerAuth()
@Controller('resources/description-images')
export class ResourceDescriptionImageController {
    constructor(private readonly descriptionImageService: ResourceDescriptionImageService) { }

    /**
     * Upload a description image (temporary)
     * If the same image was already uploaded, returns the existing URL instead
     */
    @Post(':resourceId/upload')
    @ApiOperation({
        summary: 'Upload a description image',
        description:
            'Uploads an image for use in resource descriptions. Images are temporary by default and will be validated when the resource is saved. Maximum 20 temporary images per user.',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.descriptionImageService.uploadImage(session.user.id, resourceId, file);
    }

    /**
     * Get all temporary images for a resource
     */
    @Get(':resourceId/temporary')
    @ApiOperation({
        summary: 'Get all temporary images for a resource',
        description: 'Retrieves all temporary images uploaded for a specific resource by the current user.',
    })
    async getTemporaryImages(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.descriptionImageService.getTemporaryImages(session.user.id, resourceId);
    }

    /**
     * Delete a temporary image
     */
    @Delete(':resourceId/:imageId')
    @ApiOperation({
        summary: 'Delete a temporary image',
        description: 'Deletes a temporary image that has not yet been used in a resource.',
    })
    async deleteTemporaryImage(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.descriptionImageService.deleteTemporaryImage(session.user.id, resourceId, imageId);
    }
}