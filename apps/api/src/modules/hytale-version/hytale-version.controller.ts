import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { prisma } from '@repo/db';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@ApiTags('Hytale Versions')
@Controller('hytale-versions')
export class HytaleVersionController {
    @Get()
    @ApiOperation({ summary: 'Get all Hytale versions' })
    @AllowAnonymous()
    @ApiResponse({ status: 200, description: 'List of Hytale versions' })
    async getAllVersions() {
        return prisma.hytaleVersion.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                hytaleVersion: true,
                name: true,
                releaseDate: true,
                createdAt: true,
            },
        });
    }
}
