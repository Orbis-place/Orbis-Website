import {ApiPropertyOptional} from '@nestjs/swagger';
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
import {Type} from 'class-transformer';
import {ResourceType, ResourceVisibility} from './create-resource.dto';

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
    @ApiPropertyOptional({description: 'Link ID (for updates/deletes)'})
    @IsString()
    @IsOptional()
    id?: string;

    @ApiPropertyOptional({example: 'SOURCE_CODE', enum: ExternalLinkType})
    @IsEnum(ExternalLinkType)
    type: ExternalLinkType;

    @ApiPropertyOptional({example: 'https://github.com/user/repo'})
    @IsUrl()
    url: string;

    @ApiPropertyOptional({example: 'Main Repository'})
    @IsString()
    @IsOptional()
    @MaxLength(100)
    label?: string;
}

export class UpdateResourceDto {
    @ApiPropertyOptional({example: 'My Awesome Plugin', description: 'Resource name'})
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
        example: 'PLUGIN',
        description: 'Resource type',
        enum: ResourceType,
    })
    @IsEnum(ResourceType)
    @IsOptional()
    type?: ResourceType;

    @ApiPropertyOptional({
        example: 'PUBLIC',
        description: 'Resource visibility',
        enum: ResourceVisibility,
    })
    @IsEnum(ResourceVisibility)
    @IsOptional()
    visibility?: ResourceVisibility;

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

    // External Links
    @ApiPropertyOptional({
        description: 'External links to add/update',
        type: [ExternalLinkDto],
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({each: true})
    @Type(() => ExternalLinkDto)
    externalLinks?: ExternalLinkDto[];

    @ApiPropertyOptional({
        description: 'External link IDs to remove',
        example: ['link-id-1', 'link-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({each: true})
    removeExternalLinks?: string[];

    // Tags
    @ApiPropertyOptional({
        description: 'Tag IDs to add',
        example: ['tag-id-1', 'tag-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({each: true})
    addTags?: string[];

    @ApiPropertyOptional({
        description: 'Tag IDs to remove',
        example: ['tag-id-1'],
    })
    @IsArray()
    @IsOptional()
    @IsString({each: true})
    removeTags?: string[];

    @ApiPropertyOptional({
        description: 'Tag IDs to feature (max 3)',
        example: ['tag-id-1', 'tag-id-2'],
    })
    @IsArray()
    @IsOptional()
    @IsString({each: true})
    @ArrayMaxSize(3)
    featuredTags?: string[];
}