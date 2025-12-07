import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { StorageModule } from '../storage/storage.module';
import { ServerCategoryController } from "./server-category.controller";
import { ServerCategoryService } from "./server-category.service";
import { ServerTagService } from "./server-tag.service";
import { ServerTagController } from "./server-tag.controller";

@Module({
    imports: [StorageModule],
    controllers: [
        ServerController,
        ServerCategoryController,
        ServerTagController,
    ],
    providers: [ServerService, ServerCategoryService, ServerTagService],
    exports: [ServerService],
})
export class ServerModule {
}