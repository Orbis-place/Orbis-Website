import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { LikeService } from './like.service';

@ApiTags('resources - likes')
@Controller('resources/:resourceId/likes')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Like a resource' })
    async likeResource(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.likeService.likeResource(resourceId, session.user.id);
    }

    @Delete()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unlike a resource' })
    async unlikeResource(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.likeService.unlikeResource(resourceId, session.user.id);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if current user has liked the resource' })
    async hasLiked(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.likeService.hasLiked(resourceId, session.user.id);
    }

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all likes for a resource' })
    async getLikes(@Param('resourceId') resourceId: string) {
        return this.likeService.getLikes(resourceId);
    }
}
