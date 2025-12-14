import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEnum,
    IsOptional,
    MinLength,
    MaxLength,
    IsArray,
    ValidateNested,
    IsUrl,
    ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from './create-resource.dto';
import { PriceType } from '@repo/db';

export enum LicenseType {
    // Common open source
    MIT = 'MIT',
    APACHE_2_0 = 'APACHE_2_0',
    GPL_3_0 = 'GPL_3_0',
    LGPL_3_0 = 'LGPL_3_0',
    BSD_3_CLAUSE = 'BSD_3_CLAUSE',
    BSD_2_CLAUSE = 'BSD_2_CLAUSE',
    MPL_2_0 = 'MPL_2_0',

    // Creative Commons
    CC_BY_4_0 = 'CC_BY_4_0',
    CC_BY_SA_4_0 = 'CC_BY_SA_4_0',
    CC_BY_NC_4_0 = 'CC_BY_NC_4_0',
    CC_BY_NC_SA_4_0 = 'CC_BY_NC_SA_4_0',
    CC_BY_ND_4_0 = 'CC_BY_ND_4_0',
    CC_BY_NC_ND_4_0 = 'CC_BY_NC_ND_4_0',
    CC0_1_0 = 'CC0_1_0',

    // Restrictive
    ALL_RIGHTS_RESERVED = 'ALL_RIGHTS_RESERVED',

    // Custom
    CUSTOM = 'CUSTOM',
}

export enum ExternalLinkType {
    ISSUE_TRACKER = 'ISSUE_TRACKER',
    SOURCE_CODE = 'SOURCE_CODE',
    WIKI = 'WIKI',
    DISCORD = 'DISCORD',
    DONATION = 'DONATION',
    WEBSITE = 'WEBSITE',
    OTHER = 'OTHER',
}

export class ExternalLinkDto {
    @ApiPropertyOptional({ description: 'Link ID (for updates/deletes)' })
    @IsString()
    @IsOptional()
    id?: string;

    @ApiPropertyOptional({ example: 'SOURCE_CODE', enum: ExternalLinkType })
    @IsEnum(ExternalLinkType)
    type: ExternalLinkType;

    @ApiPropertyOptional({ example: 'https://github.com/user/repo' })
    @IsUrl()
    url: string;

    @ApiPropertyOptional({ example: 'Main Repository' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    label?: string;
}

export class UpdateResourceDto {
    @ApiPropertyOptional({ example: 'My Awesome Plugin', description: 'Resource name' })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        example: 'The best plugin for your server',
        description: 'Short tagline (max 200 chars)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    tagline?: string;

    @ApiPropertyOptional({
        example: 'This is a detailed description of the plugin with all its features...',
        description: 'Full description (Markdown/HTML)',
    })
    @IsString()
    @IsOptional()
    @MinLength(50)
    @MaxLength(50000)
    description?: string;

    @ApiPropertyOptional({
        example: 'my-awesome-plugin',
        description: 'URL-friendly slug',
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    slug?: string;

    // License
    @ApiPropertyOptional({
        example: 'MIT',
        description: 'License type',
        enum: LicenseType,
    })
    @IsEnum(LicenseType)
    @IsOptional()
    licenseType?: LicenseType;

    @ApiPropertyOptional({
        example: 'My Custom License',
        description: 'Custom license name (only for CUSTOM license type)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    customLicenseName?: string;

    @ApiPropertyOptional({
        example: 'MIT',
        description: 'SPDX identifier (optional, for CUSTOM license type)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    licenseSpdxId?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/license',
        description: 'License URL (required for CUSTOM license type)',
    })
    @IsUrl()
    @IsOptional()
    licenseUrl?: string;

    // Price
    @ApiPropertyOptional({
        example: 'FREE',
        description: 'Price type',
        enum: PriceType,
    })
    @IsEnum(PriceType)
    @IsOptional()
    priceType?: PriceType;

    // External Links
    @ApiPropertyOptional({
        description: 'External links to add/update',
        type: [ExternalLinkDto],
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ExternalLinkDto)
    externalLinks?: ExternalLinkDto[];

    @ApiPropertyOptional({
        description: 'External link IDs to remove',
        example: ['link-id-1', 'link-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    removeExternalLinks?: string[];

    // Tags
    @ApiPropertyOptional({
        description: 'Tag names to add (will be created if they don\'t exist), max 10 tags total per resource',
        example: ['Vanilla', 'Performance', 'Medieval'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @MinLength(2, { each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    addTags?: string[];

    @ApiPropertyOptional({
        description: 'Tag names or slugs to remove',
        example: ['vanilla', 'performance'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    removeTags?: string[];

    @ApiPropertyOptional({
        description: 'Tag IDs or names to mark as featured (max 3)',
        example: ['tag-id-1', 'tag-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @ArrayMaxSize(3)
    featuredTags?: string[];

    // Categories
    @ApiPropertyOptional({
        description: 'Category IDs to add, max 3 categories total per resource',
        example: ['category-id-1', 'category-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @ArrayMaxSize(3)
    addCategories?: string[];

    @ApiPropertyOptional({
        description: 'Category IDs to remove',
        example: ['category-id-1'],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    removeCategories?: string[];
}