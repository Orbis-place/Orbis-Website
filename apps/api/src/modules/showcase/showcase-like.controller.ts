import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ShowcaseLikeService } from './showcase-like.service';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseLikeController {
    constructor(private readonly likeService: ShowcaseLikeService) { }

    @Post(':id/like')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Like a showcase post' })
    async like(
        @Session() session: UserSession,
        @Param('id') postId: string,
    ) {
        return this.likeService.likePost(postId, session.user.id);
    }

    @Delete(':id/like')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unlike a showcase post' })
    async unlike(
        @Session() session: UserSession,
        @Param('id') postId: string,
    ) {
        return this.likeService.unlikePost(postId, session.user.id);
    }

    @Get(':id/like')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if current user has liked a post' })
    async hasLiked(
        @Session() session: UserSession,
        @Param('id') postId: string,
    ) {
        return this.likeService.hasLiked(postId, session.user.id);
    }

    @Get(':id/likes')
    @ApiOperation({ summary: 'Get users who liked a post' })
    async getLikes(
        @Param('id') postId: string,
        @Query('limit') limit?: number,
    ) {
        return this.likeService.getLikes(postId, limit || 20);
    }
}
