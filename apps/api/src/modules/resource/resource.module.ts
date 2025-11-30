import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { ResourceGalleryImageController } from './resource-gallery-image.controller';
import { ResourceGalleryImageService } from './resource-gallery-image.service';
import { ResourceDescriptionImageController } from './resource-description-image.controller';
import { ResourceDescriptionImageService } from './resource-description-image.service';
import { ContributorController } from './contributor.controller';
import { ContributorService } from './contributor.service';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { UserFavoritesController } from './user-favorites.controller';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [
        ResourceController,
        ResourceGalleryImageController,
        ResourceDescriptionImageController,
        ContributorController,
        LikeController,
        FavoriteController,
        UserFavoritesController,
        VersionController,
    ],
    providers: [
        ResourceService,
        ResourceGalleryImageService,
        ResourceDescriptionImageService,
        ContributorService,
        LikeService,
        FavoriteService,
        VersionService,
    ],
    exports: [
        ResourceService,
        ResourceGalleryImageService,
        ResourceDescriptionImageService,
        ContributorService,
        LikeService,
        FavoriteService,
        VersionService,
    ],
})
export class ResourceModule {}