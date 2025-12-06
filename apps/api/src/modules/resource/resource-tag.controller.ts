import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ResourceTagService } from './resource-tag.service';
import { ResourceType } from '@repo/db';

@ApiTags('resource-tags')
@Controller('resource-tags')
export class ResourceTagController {
    constructor(private readonly tagService: ResourceTagService) { }

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all resource tags with optional search' })
    @ApiQuery({ name: 'search', required: false, description: 'Search query for tag name' })
    @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
    async getAllTags(
        @Query('search') search?: string,
        @Query('limit') limit?: number,
    ) {
        return this.tagService.getAllTags(search, limit ? parseInt(limit.toString()) : undefined);
    }

    @Get('search')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Search tags for autocomplete' })
    @ApiQuery({ name: 'q', required: false, description: 'Search query' })
    @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
    async searchTags(
        @Query('q') query?: string,
        @Query('limit') limit?: number,
    ) {
        return this.tagService.searchTags(query || '', limit ? parseInt(limit.toString()) : undefined);
    }

    @Get('popular/:type')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get popular tags for a specific resource type' })
    @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', type: Number })
    async getPopularTagsForType(
        @Param('type') type: ResourceType,
        @Query('limit') limit?: number,
    ) {
        return this.tagService.getPopularTagsForType(type, limit ? parseInt(limit.toString()) : undefined);
    }

    @Get('slug/:slug')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get tag by slug' })
    async getTagBySlug(@Param('slug') slug: string) {
        return this.tagService.getTagBySlug(slug);
    }

    @Get(':id')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get tag by ID' })
    async getTagById(@Param('id') id: string) {
        return this.tagService.getTagById(id);
    }
}
