import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ResourceDependencyService } from './resource-dependency.service';
import { CreateDependencyDto, UpdateDependencyDto } from './dtos/resource-dependency.dto';

@ApiTags('resources/dependencies')
@Controller('resources/:resourceId')
export class ResourceDependencyController {
    constructor(private readonly resourceDependencyService: ResourceDependencyService) { }

    // ============================================
    // VERSION DEPENDENCIES
    // ============================================

    @Post('versions/:versionId/dependencies')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a dependency to a version' })
    async addDependency(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() createDto: CreateDependencyDto,
    ) {
        return this.resourceDependencyService.addDependency(
            resourceId,
            versionId,
            session.user.id,
            createDto,
        );
    }

    @Get('versions/:versionId/dependencies')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all dependencies for a version' })
    async getDependencies(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
    ) {
        return this.resourceDependencyService.getDependencies(resourceId, versionId);
    }

    @Patch('versions/:versionId/dependencies/:dependencyId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a dependency' })
    async updateDependency(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('dependencyId') dependencyId: string,
        @Session() session: UserSession,
        @Body() updateDto: UpdateDependencyDto,
    ) {
        return this.resourceDependencyService.updateDependency(
            resourceId,
            versionId,
            dependencyId,
            session.user.id,
            updateDto,
        );
    }

    @Delete('versions/:versionId/dependencies/:dependencyId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a dependency from a version' })
    async removeDependency(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('dependencyId') dependencyId: string,
        @Session() session: UserSession,
    ) {
        return this.resourceDependencyService.removeDependency(
            resourceId,
            versionId,
            dependencyId,
            session.user.id,
        );
    }

    // ============================================
    // RESOURCE DEPENDENTS (who depends on this resource)
    // ============================================

    @Get('dependents')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get resources that depend on this resource' })
    async getDependents(
        @Param('resourceId') resourceId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.resourceDependencyService.getDependents(
            resourceId,
            parseInt(page, 10) || 1,
            Math.min(parseInt(limit, 10) || 20, 100),
        );
    }
}
