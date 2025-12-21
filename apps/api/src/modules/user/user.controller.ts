import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { UserService } from "./user.service";
import { AllowAnonymous, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { FileInterceptor } from '@nestjs/platform-express';
import { ServerService } from "../server/server.service";
import { CreateSocialLinkDto } from "./dtos/create-social-link.dto";
import { UpdateSocialLinkDto } from "./dtos/update-social-link.dto";
import { ReorderSocialLinksDto } from "./dtos/reorder-social-links.dto";
import { SearchUsersDto } from "./dtos/search-users.dto";

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService,
        private readonly serverService: ServerService
    ) {
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getMe(@Session() session: UserSession) {
        return this.userService.findById(session.user.id);
    }

    @Get('sitemap')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get users for sitemap' })
    async getSitemapUsers() {
        return this.userService.getSitemapUsers();
    }

    @Patch('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMe(
        @Session() session: UserSession,
        @Body() updateDto: UpdateProfileDto,
    ) {
        return this.userService.updateProfile(session.user.id, updateDto);
    }

    @Post('me/image')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload profile image' })
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.userService.uploadProfileImage(session.user.id, file);
    }

    @Delete('me/image')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete profile image' })
    async deleteImage(@Session() session: UserSession) {
        return this.userService.deleteProfileImage(session.user.id);
    }

    @Post('me/banner')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload profile banner' })
    @UseInterceptors(FileInterceptor('banner'))
    async uploadBanner(
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.userService.uploadProfileBanner(session.user.id, file);
    }

    @Delete('me/banner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete profile banner' })
    async deleteBanner(@Session() session: UserSession) {
        return this.userService.deleteProfileBanner(session.user.id);
    }

    @Get('me/servers')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user servers' })
    async getUserServers(@Session() session: UserSession) {
        return this.serverService.getUserServers(session.user.id);
    }

    @Post(':userId/follow')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Follow a user' })
    async followUser(
        @Session() session: UserSession,
        @Param('userId') userId: string,
    ) {
        return this.userService.followUser(session.user.id, userId);
    }

    @Delete(':userId/follow')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unfollow a user' })
    async unfollowUser(
        @Session() session: UserSession,
        @Param('userId') userId: string,
    ) {
        return this.userService.unfollowUser(session.user.id, userId);
    }

    @Get(':userId/followers')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user followers' })
    async getFollowers(
        @Param('userId') userId: string,
        @Session() session: UserSession,
    ) {
        return this.userService.getFollowers(userId, session.user.id);
    }

    @Get(':userId/following')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get users that this user is following' })
    async getFollowing(
        @Param('userId') userId: string,
        @Session() session: UserSession,
    ) {
        return this.userService.getFollowing(userId, session.user.id);
    }

    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search users by username or display name' })
    async searchUsers(@Query() searchDto: SearchUsersDto) {
        return this.userService.searchUsers(searchDto);
    }

    @Get('username/:username')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get user profile by username' })
    async getUserProfileByUsername(
        @Param('username') username: string,
        @Session() session: UserSession,
        @Req() req: any,
    ) {
        return this.userService.getUserProfileByUsername(username, session?.user?.id);
    }

    @Get(':userId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get user profile by ID' })
    async getUserProfile(@Param('userId') userId: string) {
        return this.userService.getUserProfile(userId);
    }

    // ============================================
    // SOCIAL LINKS
    // ============================================

    @Get('me/social-links')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user social links' })
    async getMySocialLinks(@Session() session: UserSession) {
        return this.userService.getSocialLinks(session.user.id);
    }

    @Post('me/social-links')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a social link' })
    async createSocialLink(
        @Session() session: UserSession,
        @Body() createDto: CreateSocialLinkDto,
    ) {
        return this.userService.createSocialLink(session.user.id, createDto);
    }


    @Patch('me/social-links/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder social links' })
    async reorderSocialLinks(
        @Session() session: UserSession,
        @Body() reorderDto: ReorderSocialLinksDto,
    ) {
        return this.userService.reorderSocialLinks(session.user.id, reorderDto.linkIds);
    }

    @Patch('me/social-links/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a social link' })
    async updateSocialLink(
        @Session() session: UserSession,
        @Param('id') id: string,
        @Body() updateDto: UpdateSocialLinkDto,
    ) {
        return this.userService.updateSocialLink(session.user.id, id, updateDto);
    }

    @Delete('me/social-links/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a social link' })
    async deleteSocialLink(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return this.userService.deleteSocialLink(session.user.id, id);
    }

}