import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ResourceGalleryImageService } from './resource-gallery-image.service';
import { CreateGalleryImageDto, UpdateGalleryImageDto, ReorderGalleryImagesDto } from './dtos/gallery-image.dto';

@ApiTags('resources/gallery-images')
@Controller('resources/:resourceId/gallery-images')
export class ResourceGalleryImageController {
    constructor(private readonly galleryImageService: ResourceGalleryImageService) {}

    // ============================================
    // AUTHENTICATED ENDPOINTS
    // ============================================

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a gallery image to a resource' })
    async create(
        @Param('resourceId') resourceId: string,
        @Session() session: UserSession,
        @Body() createDto: CreateGalleryImageDto,
    ) {
        return this.galleryImageService.create(resourceId, session.user.id, createDto);
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
