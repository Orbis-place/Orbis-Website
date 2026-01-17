import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ModpackService } from './modpack.service';
import {
    AddPlatformModDto,
    AddCustomModDto,
    UpdateModEntryDto,
    ReorderModEntriesDto,
    ForkModpackDto,
} from './dtos/modpack.dto';

@ApiTags('Modpacks')
@Controller()
export class ModpackController {
    constructor(private readonly modpackService: ModpackService) { }

    // =========================================================================
    // READ OPERATIONS (Public)
    // =========================================================================

    @Get('modpacks/:slug')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get modpack by slug' })
    async getModpackBySlug(@Param('slug') slug: string) {
        return this.modpackService.getModpackBySlug(slug);
    }

    @Get('modpacks/:slug/forks')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get forks of a modpack' })
    async getModpackForks(@Param('slug') slug: string) {
        const modpack = await this.modpackService.getModpackBySlug(slug);
        return this.modpackService.getModpackForks(modpack.resourceId);
    }

    @Get('resources/:resourceId/versions/:versionId/modpack/entries')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get mod entries for a modpack version' })
    async getModpackEntries(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
    ) {
        return this.modpackService.getModpackEntries(resourceId, versionId);
    }

    // =========================================================================
    // MOD ENTRY MANAGEMENT (Authenticated)
    // =========================================================================

    @Post('resources/:resourceId/versions/:versionId/modpack/mods/platform')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a platform mod to the modpack version' })
    async addPlatformMod(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() dto: AddPlatformModDto,
    ) {
        return this.modpackService.addPlatformMod(resourceId, versionId, session.user.id, dto);
    }

    @Post('resources/:resourceId/versions/:versionId/modpack/mods/custom')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Add a custom mod (uploaded JAR) to the modpack version' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                customModName: { type: 'string' },
                customModVersion: { type: 'string' },
                isRequired: { type: 'boolean' },
                notes: { type: 'string' },
                order: { type: 'number' },
            },
            required: ['file', 'customModName', 'customModVersion'],
        },
    })
    async addCustomMod(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() dto: AddCustomModDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.modpackService.addCustomMod(resourceId, versionId, session.user.id, dto, file);
    }

    @Patch('resources/:resourceId/versions/:versionId/modpack/mods/:entryId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a mod entry' })
    async updateModEntry(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('entryId') entryId: string,
        @Session() session: UserSession,
        @Body() dto: UpdateModEntryDto,
    ) {
        return this.modpackService.updateModEntry(resourceId, versionId, session.user.id, entryId, dto);
    }

    @Delete('resources/:resourceId/versions/:versionId/modpack/mods/:entryId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove a mod from the modpack version' })
    async removeModEntry(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('entryId') entryId: string,
        @Session() session: UserSession,
    ) {
        return this.modpackService.removeModEntry(resourceId, versionId, session.user.id, entryId);
    }

    @Post('resources/:resourceId/versions/:versionId/modpack/mods/reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder mod entries' })
    async reorderModEntries(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() dto: ReorderModEntriesDto,
    ) {
        return this.modpackService.reorderModEntries(resourceId, versionId, session.user.id, dto);
    }

    // =========================================================================
    // CONFIG MANAGEMENT
    // =========================================================================

    @Post('resources/:resourceId/versions/:versionId/modpack/mods/:entryId/config')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload config for a mod entry' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    async uploadModConfig(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('entryId') entryId: string,
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.modpackService.uploadModConfig(resourceId, versionId, session.user.id, entryId, file);
    }

    @Delete('resources/:resourceId/versions/:versionId/modpack/mods/:entryId/config')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete config for a mod entry' })
    async deleteModConfig(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('entryId') entryId: string,
        @Session() session: UserSession,
    ) {
        return this.modpackService.deleteModConfig(resourceId, versionId, session.user.id, entryId);
    }

    // =========================================================================
    // FORK
    // =========================================================================

    @Post('resources/:resourceId/modpack/fork')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Fork a modpack' })
    async forkModpack(
        @Param('resourceId') resourceId: string,
        @Session() session: UserSession,
        @Body() dto: ForkModpackDto,
    ) {
        return this.modpackService.forkModpack(resourceId, session.user.id, dto);
    }
}
