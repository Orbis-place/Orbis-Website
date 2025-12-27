import {
    Body,
    Controller,
    Delete,
    Get,
    Ip,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ShowcaseService } from './showcase.service';
import { CreateShowcasePostDto } from './dtos/create-showcase-post.dto';
import { UpdateShowcasePostDto } from './dtos/update-showcase-post.dto';
import { FilterShowcasePostsDto } from './dtos/filter-showcase-posts.dto';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseController {
    constructor(private readonly showcaseService: ShowcaseService) { }

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all published showcase posts' })
    async getAll(@Query() filterDto: FilterShowcasePostsDto) {
        return this.showcaseService.getAll(filterDto);
    }

    @Get('categories')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get showcase categories with counts' })
    async getCategories() {
        return this.showcaseService.getCategories();
    }

    @Get('featured')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get featured showcase posts' })
    async getFeatured(@Query('limit') limit?: number) {
        return this.showcaseService.getFeatured(limit || 10);
    }

    @Get('sitemap')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get showcase posts for sitemap' })
    async getSitemap() {
        return this.showcaseService.getSitemapPosts();
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user showcase posts (all statuses)' })
    async getMyPosts(
        @Session() session: UserSession,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.showcaseService.getMyPosts(session.user.id, page || 1, limit || 20);
    }

    @Get(':id')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get a showcase post by ID' })
    async getById(
        @Param('id') id: string,
        @Ip() ip: string,
        @Session() session?: UserSession,
    ) {
        return this.showcaseService.getById(id, session?.user?.id, ip);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new showcase post' })
    async create(
        @Session() session: UserSession,
        @Body() createDto: CreateShowcasePostDto,
    ) {
        return this.showcaseService.create(session.user.id, createDto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a showcase post' })
    async update(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() updateDto: UpdateShowcasePostDto,
    ) {
        return this.showcaseService.update(id, session.user.id, updateDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a showcase post' })
    async delete(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.showcaseService.delete(id, session.user.id);
    }
}
