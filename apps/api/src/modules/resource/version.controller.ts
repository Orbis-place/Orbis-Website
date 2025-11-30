import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    Req,
    Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { VersionService } from './version.service';
import {
    CreateVersionDto,
    UpdateVersionDto,
    UploadVersionFileDto,
    SetPrimaryFileDto,
} from './dtos/version.dto';
import { Request, Response } from 'express';

@ApiTags('resources/versions')
@Controller('resources/:resourceId/versions')
export class VersionController {
    constructor(private readonly versionService: VersionService) {}

    // ============================================
    // VERSION CRUD
    // ============================================

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new version for a resource' })
    async create(
        @Param('resourceId') resourceId: string,
        @Session() session: UserSession,
        @Body() createDto: CreateVersionDto,
    ) {
        return this.versionService.create(resourceId, session.user.id, createDto);
    }

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all versions for a resource' })
    async findAll(@Param('resourceId') resourceId: string) {
        return this.versionService.findAll(resourceId);
    }

    @Get(':versionId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get a specific version by ID' })
    async findOne(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
    ) {
        return this.versionService.findOne(resourceId, versionId);
    }

    @Patch(':versionId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a version' })
    async update(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() updateDto: UpdateVersionDto,
    ) {
        return this.versionService.update(resourceId, versionId, session.user.id, updateDto);
    }

    @Delete(':versionId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a version' })
    async delete(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
    ) {
        return this.versionService.delete(resourceId, versionId, session.user.id);
    }

    // ============================================
    // VERSION FILES
    // ============================================

    @Post(':versionId/files')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file for a version' })
    @ApiBody({
        description: 'File upload with optional display name',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'The file to upload (JAR, ZIP, etc.)',
                },
                displayName: {
                    type: 'string',
                    description: 'Optional display name for the file',
                },
            },
            required: ['file'],
        },
    })
    async uploadFile(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadDto: UploadVersionFileDto,
    ) {
        return this.versionService.uploadFile(
            resourceId,
            versionId,
            session.user.id,
            file,
            uploadDto.displayName,
        );
    }

    @Delete(':versionId/files/:fileId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a version file' })
    async deleteFile(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('fileId') fileId: string,
        @Session() session: UserSession,
    ) {
        return this.versionService.deleteFile(resourceId, versionId, fileId, session.user.id);
    }

    @Patch(':versionId/files/primary')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set a file as the primary download file' })
    async setPrimaryFile(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
        @Body() setPrimaryDto: SetPrimaryFileDto,
    ) {
        return this.versionService.setPrimaryFile(
            resourceId,
            versionId,
            setPrimaryDto.fileId,
            session.user.id,
        );
    }

    // ============================================
    // DOWNLOAD
    // ============================================

    @Get(':versionId/download/:fileId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Download a version file' })
    async downloadFile(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Param('fileId') fileId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // Get userId from session if authenticated
        const userId = (req as any).user?.id;

        const result = await this.versionService.downloadFile(
            resourceId,
            versionId,
            fileId,
            userId,
            req.ip,
            req.get('user-agent'),
        );

        // Redirect to the actual download URL
        return res.redirect(result.downloadUrl);
    }

    @Get(':versionId/download')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Download the primary file of a version' })
    async downloadPrimaryFile(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // Get version to find primary file
        const { version } = await this.versionService.findOne(resourceId, versionId);

        if (!version.primaryFileId) {
            throw new Error('No primary file set for this version');
        }

        // Get userId from session if authenticated
        const userId = (req as any).user?.id;

        const result = await this.versionService.downloadFile(
            resourceId,
            versionId,
            version.primaryFileId,
            userId,
            req.ip,
            req.get('user-agent'),
        );

        // Redirect to the actual download URL
        return res.redirect(result.downloadUrl);
    }

    // ============================================
    // VERSION MANAGEMENT
    // ============================================

    @Patch(':versionId/set-latest')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set this version as the latest version for the resource' })
    async setAsLatest(
        @Param('resourceId') resourceId: string,
        @Param('versionId') versionId: string,
        @Session() session: UserSession,
    ) {
        return this.versionService.setAsLatest(resourceId, versionId, session.user.id);
    }
}