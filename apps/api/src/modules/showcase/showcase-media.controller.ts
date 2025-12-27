import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Body,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ShowcaseMediaService } from './showcase-media.service';
import { ShowcaseMediaType } from '@repo/db';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseMediaController {
    constructor(private readonly mediaService: ShowcaseMediaService) { }

    @Get(':id/media')
    @ApiOperation({ summary: 'Get media for a showcase post' })
    async getMedia(@Param('id') postId: string) {
        return this.mediaService.getMedia(postId);
    }

    @Post(':id/media')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload media to a showcase post' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(
        @Session() session: UserSession,
        @Param('id') postId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('type') type?: ShowcaseMediaType,
        @Body('caption') caption?: string,
    ) {
        return this.mediaService.uploadMedia(
            postId,
            session.user.id,
            file,
            type || ShowcaseMediaType.IMAGE,
            caption,
        );
    }

    @Delete(':id/media/:mediaId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete media from a showcase post' })
    async deleteMedia(
        @Session() session: UserSession,
        @Param('mediaId') mediaId: string,
    ) {
        return this.mediaService.deleteMedia(mediaId, session.user.id);
    }

    @Post(':id/media/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder media on a showcase post' })
    async reorderMedia(
        @Session() session: UserSession,
        @Param('id') postId: string,
        @Body() body: { mediaIds: string[] },
    ) {
        return this.mediaService.reorderMedia(postId, session.user.id, body.mediaIds);
    }
}
