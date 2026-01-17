import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { ResourceTagController } from './resource-tag.controller';
import { ResourceTagService } from './resource-tag.service';
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
import { VersionChangelogImageController } from './version-changelog-image.controller';
import { VersionChangelogImageService } from './version-changelog-image.service';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ResourceDependencyController } from './resource-dependency.controller';
import { ResourceDependencyService } from './resource-dependency.service';
import { ModpackController } from './modpack.controller';
import { ModpackService } from './modpack.service';
import { StorageModule } from '../storage/storage.module';
import { RedisModule } from '../../common/redis.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [StorageModule, RedisModule, NotificationModule],
    controllers: [
        ResourceController,
        ResourceTagController,
        ResourceGalleryImageController,
        ResourceDescriptionImageController,
        ContributorController,
        LikeController,
        FavoriteController,
        UserFavoritesController,
        VersionController,
        VersionChangelogImageController,
        CollectionController,
        CommentController,
        ResourceDependencyController,
        ModpackController,
    ],
    providers: [
        ResourceService,
        ResourceTagService,
        ResourceGalleryImageService,
        ResourceDescriptionImageService,
        ContributorService,
        LikeService,
        FavoriteService,
        VersionService,
        VersionChangelogImageService,
        CollectionService,
        CommentService,
        ResourceDependencyService,
        ModpackService,
    ],
    exports: [
        ResourceService,
        ResourceTagService,
        ResourceGalleryImageService,
        ResourceDescriptionImageService,
        ContributorService,
        LikeService,
        FavoriteService,
        VersionService,
        VersionChangelogImageService,
        CollectionService,
        CommentService,
        ResourceDependencyService,
        ModpackService,
    ],
})
export class ResourceModule { }