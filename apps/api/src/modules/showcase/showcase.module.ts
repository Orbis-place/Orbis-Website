import { Module } from '@nestjs/common';

import { ShowcaseController } from './showcase.controller';
import { ShowcaseLikeController } from './showcase-like.controller';
import { ShowcaseCommentController } from './showcase-comment.controller';
import { ShowcaseMediaController } from './showcase-media.controller';

import { ShowcaseService } from './showcase.service';
import { ShowcaseLikeService } from './showcase-like.service';
import { ShowcaseCommentService } from './showcase-comment.service';
import { ShowcaseMediaService } from './showcase-media.service';

import { StorageService } from '../storage/storage.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [NotificationModule],
    controllers: [
        ShowcaseController,
        ShowcaseLikeController,
        ShowcaseCommentController,
        ShowcaseMediaController,
    ],
    providers: [
        ShowcaseService,
        ShowcaseLikeService,
        ShowcaseCommentService,
        ShowcaseMediaService,
        StorageService,
    ],
    exports: [ShowcaseService],
})
export class ShowcaseModule { }
