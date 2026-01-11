import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [NotificationModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
