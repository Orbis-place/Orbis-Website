import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous, Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dtos/create-resource.dto';
import { UpdateResourceDto } from './dtos/update-resource.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ModerateResourceDto } from './dtos/moderate-resource.dto';
import { ResourceStatus, UserRole } from '@repo/db';
import { CreateResourceExternalLinkDto } from './dtos/create-resource-external-link.dto';
import { UpdateResourceExternalLinkDto } from './dtos/update-resource-external-link.dto';
import { ReorderResourceExternalLinksDto } from './dtos/reorder-resource-external-links.dto';
import { FilterResourcesDto } from './dtos/filter-resources.dto';


@ApiTags('resources')
@Controller('resources')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) { }

    // ============================================
    // PUBLIC MARKETPLACE ENDPOINT
    // ============================================

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all approved resources with filters (Public marketplace)' })
    async getAllResources(@Query() filterDto: FilterResourcesDto) {
        return this.resourceService.getAllResources(filterDto);
    }

    @Get('sitemap')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resources for sitemap' })
    async getSitemapResources() {
        return this.resourceService.getSitemapResources();
    }

    @Get('categories')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get categories filtered by resource type' })
    @ApiQuery({
        name: 'type',
        required: false,
        description: 'Filter categories by resource type',
    })
    async getCategories(@Query('type') type?: string) {
        return this.resourceService.getCategoriesForType(type as any);
    }

    // ============================================
    // AUTHENTICATED ENDPOINTS
    // ============================================

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new resource' })
    async create(
        @Session() session: UserSession,
        @Body() createDto: CreateResourceDto,
    ) {
        return this.resourceService.create(session.user.id, createDto);
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my resources with pagination' })
    async getMyResources(
        @Session() session: UserSession,
        @Query() pagination: PaginationDto,
    ) {
        return this.resourceService.getUserResources(session.user.id, pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resource by ID' })
    async getById(@Param('id') id: string) {
        return this.resourceService.getById(id);
    }

    @Get('slug/:slug')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resource by slug' })
    async getBySlug(
        @Param('slug') slug: string,
        @Session() session?: UserSession,
    ) {
        return this.resourceService.getBySlug(slug, session?.user?.id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a resource' })
    async update(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() updateDto: UpdateResourceDto,
    ) {
        return this.resourceService.update(id, session.user.id, updateDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a resource' })
    async delete(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.resourceService.delete(id, session.user.id);
    }

    // ============================================
    // FILE UPLOAD ENDPOINTS
    // ============================================

    @Post(':id/icon')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload resource icon' })
    @UseInterceptors(FileInterceptor('icon'))
    async uploadIcon(
        @Session() session: UserSession,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.resourceService.uploadIcon(id, session.user.id, file);
    }

    @Post(':id/banner')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload resource banner' })
    @UseInterceptors(FileInterceptor('banner'))
    async uploadBanner(
        @Session() session: UserSession,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.resourceService.uploadBanner(id, session.user.id, file);
    }

    @Delete(':id/icon')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete resource icon' })
    async deleteIcon(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.resourceService.deleteIcon(id, session.user.id);
    }

    @Delete(':id/banner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete resource banner' })
    async deleteBanner(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.resourceService.deleteBanner(id, session.user.id);
    }

    // ============================================
    // USER RESOURCES
    // ============================================

    @Get('user/:userId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resources by user with pagination' })
    async getUserResources(
        @Param('userId') userId: string,
        @Query() pagination: PaginationDto,
    ) {
        return this.resourceService.getUserResources(userId, pagination);
    }

    // ============================================
    // TEAM RESOURCES
    // ============================================

    @Get('team/:teamId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resources by team with pagination' })
    async getTeamResources(
        @Param('teamId') teamId: string,
        @Query() pagination: PaginationDto,
    ) {
        return this.resourceService.getTeamResources(teamId, pagination);
    }

    // ============================================
    // MODERATION ENDPOINTS
    // ============================================

    @Get('moderation/pending')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get pending resources for moderation (Moderator+ only)' })
    async getPendingResources(
        @Session() session: UserSession,
        @Query() pagination: PaginationDto,
    ) {
        return this.resourceService.getPendingResources(session.user.id, pagination);
    }

    @Get('moderation/status/:status')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get resources by status (Moderator+ only)' })
    @ApiQuery({
        name: 'status',
        enum: ResourceStatus,
        description: 'Resource status to filter by',
    })
    async getResourcesByStatus(
        @Session() session: UserSession,
        @Param('status') status: ResourceStatus,
        @Query() pagination: PaginationDto,
    ) {
        return this.resourceService.getResourcesByStatus(session.user.id, status, pagination);
    }

    @Patch('moderation/:id/moderate')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Moderate a resource - approve, reject, suspend, etc. (Moderator+ only)' })
    async moderateResource(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() moderateDto: ModerateResourceDto,
    ) {
        return this.resourceService.moderateResource(session.user.id, id, moderateDto);
    }

    @Get('moderation/:id/history')
    @ApiBearerAuth()
    @Roles([UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get resource moderation history (Moderator+ only)' })
    async getResourceModerationHistory(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.resourceService.getResourceModerationHistory(session.user.id, id);
    }

    // ============================================
    // EXTERNAL LINKS
    // ============================================

    @Get(':id/external-links')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resource external links' })
    async getExternalLinks(@Param('id') id: string) {
        return this.resourceService.getExternalLinks(id);
    }

    @Post(':id/external-links')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create an external link' })
    async createExternalLink(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() createDto: CreateResourceExternalLinkDto,
    ) {
        return this.resourceService.createExternalLink(id, session.user.id, createDto);
    }

    @Patch(':id/external-links/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder external links' })
    async reorderExternalLinks(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() reorderDto: ReorderResourceExternalLinksDto,
    ) {
        return this.resourceService.reorderExternalLinks(id, session.user.id, reorderDto.linkIds);
    }

    @Patch(':id/external-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an external link' })
    async updateExternalLink(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Param('linkId') linkId: string,
        @Body() updateDto: UpdateResourceExternalLinkDto,
    ) {
        return this.resourceService.updateExternalLink(id, session.user.id, linkId, updateDto);
    }

    @Delete(':id/external-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an external link' })
    async deleteExternalLink(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Param('linkId') linkId: string,
    ) {
        return this.resourceService.deleteExternalLink(id, session.user.id, linkId);
    }

    // ============================================
    // DONATION
    // ============================================

    @Post(':id/donation-reminder')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Schedule a donation reminder email' })
    async scheduleDonationReminder(
        @Param('id') id: string,
        @Body('email') email: string,
    ) {
        return this.resourceService.scheduleDonationReminder(id, email);
    }
}