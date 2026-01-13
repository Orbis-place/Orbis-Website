import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationModule } from '../notification/notification.module';
import { StorageModule } from '../storage/storage.module';
import { ModerationService } from './moderation.service';

@Module({
    imports: [NotificationModule, StorageModule],
    controllers: [AdminController],
    providers: [AdminService, ModerationService],
})
export class AdminModule { }
