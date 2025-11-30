import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { FavoriteService } from './favorite.service';

@ApiTags('resources - favorites')
@Controller('resources/:resourceId/favorites')
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add resource to favorites' })
    async favoriteResource(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.favoriteService.favoriteResource(resourceId, session.user.id);
    }

    @Delete()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove resource from favorites' })
    async unfavoriteResource(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.favoriteService.unfavoriteResource(resourceId, session.user.id);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if current user has favorited the resource' })
    async hasFavorited(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.favoriteService.hasFavorited(resourceId, session.user.id);
    }
}
