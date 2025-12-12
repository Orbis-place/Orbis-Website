import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceGalleryImageService } from './resource-gallery-image.service';
import { CreateGalleryImageDto, UpdateGalleryImageDto, ReorderGalleryImagesDto } from './dtos/gallery-image.dto';

@ApiTags('resources/gallery-images')
@Controller('resources/:resourceId/gallery-images')
export class ResourceGalleryImageController {
    constructor(private readonly galleryImageService: ResourceGalleryImageService) { }

    // ============================================
    // AUTHENTICATED ENDPOINTS
    // ============================================

    @Post()
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Add a gallery image to a resource' })
    async create(
        @Param('resourceId') resourceId: string,
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
        @Body() createDto: CreateGalleryImageDto,
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        return this.galleryImageService.createFromFile(resourceId, session.user.id, file, createDto);
    }

    @Patch(':imageId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a gallery image' })
    async update(
        @Param('resourceId') resourceId: string,
        @Param('imageId') imageId: string,
        @Session() session: UserSession,
        @Body() updateDto: UpdateGalleryImageDto,
    ) {
        return this.galleryImageService.update(resourceId, imageId, session.user.id, updateDto);
    }

    @Delete(':imageId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a gallery image' })
    async remove(
        @Param('resourceId') resourceId: string,
        @Param('imageId') imageId: string,
        @Session() session: UserSession,
    ) {
        return this.galleryImageService.remove(resourceId, imageId, session.user.id);
    }

    @Put('reorder')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder gallery images for a resource' })
    async reorder(
        @Param('resourceId') resourceId: string,
        @Session() session: UserSession,
        @Body() reorderDto: ReorderGalleryImagesDto,
    ) {
        return this.galleryImageService.reorder(resourceId, session.user.id, reorderDto);
    }

    @Post(':imageId/replace')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Replace the image file of a gallery image' })
    async replaceImage(
        @Param('resourceId') resourceId: string,
        @Param('imageId') imageId: string,
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        return this.galleryImageService.replaceImage(resourceId, imageId, session.user.id, file);
    }

    // ============================================
    // PUBLIC ENDPOINTS
    // ============================================

    @Get()
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get all gallery images for a resource' })
    async findAll(@Param('resourceId') resourceId: string) {
        return this.galleryImageService.findAll(resourceId);
    }

    @Get(':imageId')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get a specific gallery image' })
    async findOne(
        @Param('resourceId') resourceId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.galleryImageService.findOne(resourceId, imageId);
    }
}
