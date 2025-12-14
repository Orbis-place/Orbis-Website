// server.controller.ts
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags, } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowAnonymous, Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ServerService } from './server.service';
import { CreateServerDto } from './dtos/create-server.dto';
import { UpdateServerDto } from './dtos/update-server.dto';
import { FilterServersDto } from './dtos/filter-servers.dto';
import { ModerateServerDto, RejectServerDto } from './dtos/moderate-server.dto';
import { UserRole } from '@repo/db';
import { CreateServerSocialLinkDto } from './dtos/create-server-social-link.dto';
import { UpdateServerSocialLinkDto } from './dtos/update-server-social-link.dto';
import { ReorderServerSocialLinksDto } from './dtos/reorder-server-social-links.dto';
import { TransferServerOwnershipDto } from './dtos/transfer-server-ownership.dto';


@ApiTags('servers')
@Controller('servers')
export class ServerController {
    constructor(private readonly serverService: ServerService) {
    }

    // ============================================
    // PUBLIC ENDPOINTS
    // ============================================

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all servers with filters and pagination' })
    async findAll(@Query() filterDto: FilterServersDto) {
        return this.serverService.findAll(filterDto);
    }

    @Get(':slug')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get server by slug' })
    @ApiParam({ name: 'slug', description: 'Server slug' })
    async findBySlug(
        @Param('slug') slug: string,
        @Session({ required: false }) session?: UserSession,
    ) {
        return this.serverService.findBySlug(slug, session?.user?.id);
    }

    // ============================================
    // AUTHENTICATED ENDPOINTS
    // ============================================

    @Get('user/:userId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get servers by user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async getUserServers(
        @Param('userId') userId: string,
        @Session({ required: false }) session?: UserSession,
    ) {
        return this.serverService.getUserServers(userId, session?.user?.id);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new server' })
    async create(
        @Session() session: UserSession,
        @Body() createDto: CreateServerDto,
    ) {
        return this.serverService.create(session.user.id, createDto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update server' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async update(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() updateDto: UpdateServerDto,
    ) {
        return this.serverService.update(session.user.id, serverId, updateDto);
    }

    @Patch(':id/transfer-ownership')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Transfer server ownership to another user or team' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async transferOwnership(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() transferDto: TransferServerOwnershipDto,
    ) {
        return this.serverService.transferOwnership(
            serverId,
            session.user.id,
            transferDto.transferToUserId,
            transferDto.transferToTeamId,
        );
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete server (archive)' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async delete(
        @Session() session: UserSession,
        @Param('id') serverId: string,
    ) {
        return this.serverService.delete(session.user.id, serverId);
    }

    // ============================================
    // FILE UPLOAD ENDPOINTS
    // ============================================

    @Post(':id/logo')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload server logo' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    @UseInterceptors(FileInterceptor('logo'))
    async uploadLogo(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.serverService.uploadLogo(session.user.id, serverId, file);
    }

    @Post(':id/banner')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload server banner' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    @UseInterceptors(FileInterceptor('banner'))
    async uploadBanner(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.serverService.uploadBanner(session.user.id, serverId, file);
    }

    @Delete(':id/logo')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete server logo' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async deleteLogo(
        @Session() session: UserSession,
        @Param('id') serverId: string,
    ) {
        return this.serverService.deleteLogo(session.user.id, serverId);
    }

    @Delete(':id/banner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete server banner' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async deleteBanner(
        @Session() session: UserSession,
        @Param('id') serverId: string,
    ) {
        return this.serverService.deleteBanner(session.user.id, serverId);
    }

    // ============================================
    // ADMIN MODERATION ENDPOINTS
    // ============================================

    @Post(':id/approve')
    @ApiBearerAuth()
    @Roles([
        UserRole.ADMIN, UserRole.SUPER_ADMIN
    ])
    @ApiOperation({ summary: 'Approve server (Admin only)' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async approve(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() moderateDto: ModerateServerDto,
    ) {
        return this.serverService.approve(
            session.user.id,
            serverId,
            moderateDto?.reason,
        );
    }

    @Post(':id/reject')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Reject server (Admin only)' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async reject(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() rejectDto: RejectServerDto,
    ) {
        return this.serverService.reject(
            session.user.id,
            serverId,
            rejectDto?.reason,
        );
    }

    @Post(':id/suspend')
    @ApiBearerAuth()
    @Roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    @ApiOperation({ summary: 'Suspend server (Admin only)' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async suspend(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() moderateDto: ModerateServerDto,
    ) {
        if (!moderateDto.reason) {
            throw new BadRequestException('Reason is required for suspension');
        }
        return this.serverService.suspend(
            session.user.id,
            serverId,
            moderateDto.reason,
        );
    }

    // ============================================
    // SOCIAL LINKS MANAGEMENT ENDPOINTS
    // ============================================

    @Get(':id/social-links')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get server social links' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async getSocialLinks(@Param('id') serverId: string) {
        return this.serverService.getSocialLinks(serverId);
    }

    @Post(':id/social-links')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create server social link' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async createSocialLink(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() createDto: CreateServerSocialLinkDto,
    ) {
        return this.serverService.createSocialLink(session.user.id, serverId, createDto);
    }

    @Patch(':id/social-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update server social link' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    @ApiParam({ name: 'linkId', description: 'Social link ID' })
    async updateSocialLink(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Param('linkId') linkId: string,
        @Body() updateDto: UpdateServerSocialLinkDto,
    ) {
        return this.serverService.updateSocialLink(session.user.id, serverId, linkId, updateDto);
    }

    @Delete(':id/social-links/:linkId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete server social link' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    @ApiParam({ name: 'linkId', description: 'Social link ID' })
    async deleteSocialLink(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Param('linkId') linkId: string,
    ) {
        return this.serverService.deleteSocialLink(session.user.id, serverId, linkId);
    }

    @Patch(':id/social-links/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder server social links' })
    @ApiParam({ name: 'id', description: 'Server ID' })
    async reorderSocialLinks(
        @Session() session: UserSession,
        @Param('id') serverId: string,
        @Body() reorderDto: ReorderServerSocialLinksDto,
    ) {
        return this.serverService.reorderSocialLinks(session.user.id, serverId, reorderDto.linkIds);
    }
}