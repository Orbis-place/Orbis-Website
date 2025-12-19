import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { DiscoveryService } from './discovery.service';

@ApiTags('discovery')
@Controller('discovery')
@AllowAnonymous()
export class DiscoveryController {
    constructor(private readonly discoveryService: DiscoveryService) { }

    // ============================================
    // RESOURCE DISCOVERY ENDPOINTS
    // ============================================

    @Get('resources/selection-of-week')
    @ApiOperation({ summary: 'Get Selection of the Week resource' })
    async getSelectionOfWeek(): Promise<any> {
        return this.discoveryService.getResourceCollection('SELECTION_OF_WEEK');
    }

    @Get('resources/hidden-gems')
    @ApiOperation({ summary: 'Get Hidden Gems collection' })
    async getHiddenGems(): Promise<any> {
        return this.discoveryService.getResourceCollection('HIDDEN_GEMS');
    }

    @Get('resources/starter-pack')
    @ApiOperation({ summary: 'Get Starter Pack collection' })
    async getStarterPack(): Promise<any> {
        return this.discoveryService.getResourceCollection('STARTER_PACK');
    }

    @Get('resources/theme-of-month')
    @ApiOperation({ summary: 'Get Theme of the Month collection' })
    async getThemeOfMonth(): Promise<any> {
        return this.discoveryService.getResourceCollection('THEME_OF_MONTH');
    }

    @Get('resources/most-downloaded')
    @ApiOperation({ summary: 'Get most downloaded resources' })
    async getMostDownloaded(@Query('limit') limit?: string): Promise<any> {
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        return this.discoveryService.getMostDownloadedResources(parsedLimit);
    }
}
