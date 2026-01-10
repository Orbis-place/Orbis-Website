import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { CollectionService } from './collection.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dtos/collection.dto';

@ApiTags('collections')
@Controller()
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) { }

    // =========================================================================
    // User Collection Management (/users/me/collections)
    // =========================================================================

    @Get('users/me/collections')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all collections for current user' })
    async getUserCollections(@Session() session: UserSession) {
        return this.collectionService.getUserCollections(session.user.id);
    }

    @Get('users/me/collections/search')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search collections by name' })
    @ApiQuery({ name: 'q', required: true, description: 'Search query' })
    async searchCollections(
        @Session() session: UserSession,
        @Query('q') query: string,
    ) {
        return this.collectionService.searchCollections(session.user.id, query || '');
    }

    @Post('users/me/collections')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new collection' })
    async createCollection(
        @Session() session: UserSession,
        @Body() dto: CreateCollectionDto,
    ) {
        return this.collectionService.createCollection(session.user.id, dto);
    }

    @Get('users/me/collections/:collectionId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific collection with items' })
    async getCollectionItems(
        @Session() session: UserSession,
        @Param('collectionId') collectionId: string,
    ) {
        return this.collectionService.getCollectionItems(collectionId, session.user.id);
    }

    @Patch('users/me/collections/:collectionId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a collection' })
    async updateCollection(
        @Session() session: UserSession,
        @Param('collectionId') collectionId: string,
        @Body() dto: UpdateCollectionDto,
    ) {
        return this.collectionService.updateCollection(collectionId, session.user.id, dto);
    }

    @Delete('users/me/collections/:collectionId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a collection (cannot delete default)' })
    async deleteCollection(
        @Session() session: UserSession,
        @Param('collectionId') collectionId: string,
    ) {
        return this.collectionService.deleteCollection(collectionId, session.user.id);
    }

    // =========================================================================
    // Collection Item Management
    // =========================================================================

    @Post('users/me/collections/:collectionId/resources/:resourceId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a resource to a collection' })
    async addResourceToCollection(
        @Session() session: UserSession,
        @Param('collectionId') collectionId: string,
        @Param('resourceId') resourceId: string,
    ) {
        return this.collectionService.addResourceToCollection(
            collectionId,
            resourceId,
            session.user.id,
        );
    }

    @Delete('users/me/collections/:collectionId/resources/:resourceId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a resource from a collection' })
    async removeResourceFromCollection(
        @Session() session: UserSession,
        @Param('collectionId') collectionId: string,
        @Param('resourceId') resourceId: string,
    ) {
        return this.collectionService.removeResourceFromCollection(
            collectionId,
            resourceId,
            session.user.id,
        );
    }

    // =========================================================================
    // Resource Quick Actions
    // =========================================================================

    @Post('resources/:resourceId/save')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Quick save resource to default collection' })
    async saveResourceToDefault(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.collectionService.addResourceToDefaultCollection(
            resourceId,
            session.user.id,
        );
    }

    @Get('resources/:resourceId/collections')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get collections containing this resource (for current user)' })
    async getResourceCollections(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
    ) {
        return this.collectionService.getResourceCollections(resourceId, session.user.id);
    }

    // =========================================================================
    // Public Collection Endpoints (no auth required)
    // =========================================================================

    @Get('users/:userId/collections/public')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get public collections for a user (for profile pages)' })
    async getPublicCollections(@Param('userId') userId: string) {
        return this.collectionService.getPublicCollectionsByUser(userId);
    }

    @Get('collections/:collectionId/public')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get a public collection with items' })
    async getPublicCollection(@Param('collectionId') collectionId: string) {
        return this.collectionService.getPublicCollection(collectionId);
    }
}
