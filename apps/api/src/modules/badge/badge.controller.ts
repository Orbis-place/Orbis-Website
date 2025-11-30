import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dtos/create-badge.dto';
import { UpdateBadgeDto } from './dtos/update-badge.dto';
import { AwardBadgeDto } from './dtos/award-badge.dto';

@ApiTags('badges')
@Controller('badges')
export class BadgeController {
    constructor(private readonly badgeService: BadgeService) {}

    // ============================================
    // PUBLIC ENDPOINTS
    // ============================================

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all badges' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    async findAll(@Query('isActive') isActive?: string) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.badgeService.findAllBadges(isActiveBoolean);
    }

    @Get(':badgeId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get badge by ID' })
    @ApiParam({ name: 'badgeId', description: 'Badge ID' })
    async findById(@Param('badgeId') badgeId: string) {
        return this.badgeService.findBadgeById(badgeId);
    }

    @Get('slug/:slug')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get badge by slug' })
    @ApiParam({ name: 'slug', description: 'Badge slug' })
    async findBySlug(@Param('slug') slug: string) {
        return this.badgeService.findBadgeBySlug(slug);
    }

    // ============================================
    // ADMIN ENDPOINTS - BADGE MANAGEMENT
    // ============================================

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new badge (Admin only)' })
    async create(
        @Session() session: UserSession,
        @Body() createDto: CreateBadgeDto,
    ) {
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden: Admin access required');
        }
        return this.badgeService.createBadge(createDto);
    }

    @Patch(':badgeId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update badge (Admin only)' })
    @ApiParam({ name: 'badgeId', description: 'Badge ID' })
    async update(
        @Session() session: UserSession,
        @Param('badgeId') badgeId: string,
        @Body() updateDto: UpdateBadgeDto,
    ) {
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden: Admin access required');
        }
        return this.badgeService.updateBadge(badgeId, updateDto);
    }

    @Delete(':badgeId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete badge (Admin only)' })
    @ApiParam({ name: 'badgeId', description: 'Badge ID' })
    async delete(
        @Session() session: UserSession,
        @Param('badgeId') badgeId: string,
    ) {
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
            throw new Error('Forbidden: Admin access required');
        }
        return this.badgeService.deleteBadge(badgeId);
    }

    // ============================================
    // ADMIN ENDPOINTS - AWARD/REVOKE BADGES
    // ============================================

    @Post('award')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Award badge to user (Admin/Moderator)' })
    async awardBadge(
        @Session() session: UserSession,
        @Body() awardDto: AwardBadgeDto,
    ) {
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'MODERATOR') {
            throw new Error('Forbidden: Moderator access required');
        }
        return this.badgeService.awardBadge(awardDto, session.user.id);
    }

    @Delete(':badgeId/users/:userId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke badge from user (Admin/Moderator)' })
    @ApiParam({ name: 'badgeId', description: 'Badge ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async revokeBadge(
        @Session() session: UserSession,
        @Param('badgeId') badgeId: string,
        @Param('userId') userId: string,
    ) {
        if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'MODERATOR') {
            throw new Error('Forbidden: Moderator access required');
        }
        return this.badgeService.revokeBadge(userId, badgeId);
    }

    // ============================================
    // USER ENDPOINTS
    // ============================================

    @Get('users/:userId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get badges for a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async getUserBadges(@Param('userId') userId: string) {
        return this.badgeService.getUserBadges(userId);
    }
}