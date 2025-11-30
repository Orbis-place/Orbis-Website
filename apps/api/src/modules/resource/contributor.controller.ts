import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ContributorService } from './contributor.service';
import { AddContributorDto, UpdateContributorDto } from './dtos/contributor.dto';

@ApiTags('resources - contributors')
@Controller('resources/:resourceId/contributors')
export class ContributorController {
    constructor(private readonly contributorService: ContributorService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a contributor to a resource' })
    async addContributor(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
        @Body() dto: AddContributorDto,
    ) {
        return this.contributorService.addContributor(resourceId, session.user.id, dto);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all contributors for a resource' })
    async getContributors(@Param('resourceId') resourceId: string) {
        return this.contributorService.getContributors(resourceId);
    }

    @Patch(':userId')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update a contributor's role" })
    async updateContributor(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
        @Param('userId') userId: string,
        @Body() dto: UpdateContributorDto,
    ) {
        return this.contributorService.updateContributor(resourceId, userId, session.user.id, dto);
    }

    @Delete(':userId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a contributor from a resource' })
    async removeContributor(
        @Session() session: UserSession,
        @Param('resourceId') resourceId: string,
        @Param('userId') userId: string,
    ) {
        return this.contributorService.removeContributor(resourceId, userId, session.user.id);
    }
}
