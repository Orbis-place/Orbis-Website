import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { StorageModule } from "../storage/storage.module";
import { ServerModule } from "../server/server.module";
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [StorageModule, ServerModule, NotificationModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {
}