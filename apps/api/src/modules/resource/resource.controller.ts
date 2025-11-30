import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dtos/create-resource.dto';
import { UpdateResourceDto } from './dtos/update-resource.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ModerateResourceDto } from './dtos/moderate-resource.dto';
import { ResourceStatus, UserRole } from '@repo/db';

@ApiTags('resources')
@Controller('resources')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

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
}