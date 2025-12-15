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
import { ServerDescriptionImageService } from './server-description-image.service';

@ApiTags('servers/description-images')
@ApiBearerAuth()
@Controller('servers/description-images')
export class ServerDescriptionImageController {
    constructor(private readonly descriptionImageService: ServerDescriptionImageService) { }

    /**
     * Upload a description image (temporary)
     * If the same image was already uploaded, returns the existing URL instead
     */
    @Post(':serverId/upload')
    @ApiOperation({
        summary: 'Upload a description image',
        description:
            'Uploads an image for use in server descriptions. Images are temporary by default and will be validated when the server is saved. Maximum 20 temporary images per user.',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Session() session: UserSession,
        @Param('serverId') serverId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.descriptionImageService.uploadImage(session.user.id, serverId, file);
    }

    /**
     * Get all temporary images for a server
     */
    @Get(':serverId/temporary')
    @ApiOperation({
        summary: 'Get all temporary images for a server',
        description: 'Retrieves all temporary images uploaded for a specific server by the current user.',
    })
    async getTemporaryImages(
        @Session() session: UserSession,
        @Param('serverId') serverId: string,
    ) {
        return this.descriptionImageService.getTemporaryImages(session.user.id, serverId);
    }

    /**
     * Delete a temporary image
     */
    @Delete(':serverId/:imageId')
    @ApiOperation({
        summary: 'Delete a temporary image',
        description: 'Deletes a temporary image that has not yet been used in a server.',
    })
    async deleteTemporaryImage(
        @Session() session: UserSession,
        @Param('serverId') serverId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.descriptionImageService.deleteTemporaryImage(session.user.id, serverId, imageId);
    }
}
