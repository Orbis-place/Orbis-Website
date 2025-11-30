import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { FavoriteService } from './favorite.service';

@ApiTags('resources - favorites')
@Controller('user/favorites')
export class UserFavoritesController {
    constructor(private readonly favoriteService: FavoriteService) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get current user's favorite resources" })
    async getMyFavorites(@Session() session: UserSession) {
        return this.favoriteService.getUserFavorites(session.user.id);
    }
}
