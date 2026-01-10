import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UserModule } from "./modules/user/user.module";
import { AuthModule as OrbisAuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from '@nestjs/config';
import { auth } from '@repo/auth';
import { ServerModule } from "./modules/server/server.module";
import { TeamModule } from "./modules/team/team.module";
import { ReportModule } from "./modules/report/report.module";
import { BadgeModule } from "./modules/badge/badge.module";
import { ResourceModule } from "./modules/resource/resource.module";
import { HytaleVersionModule } from "./modules/hytale-version/hytale-version.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { ShowcaseModule } from "./modules/showcase/showcase.module";
import { RedisModule } from "./common/redis.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        AuthModule.forRoot({
            auth,
            // Fix for Express 5: The /*path pattern sets req.url=/ and req.baseUrl=full_path
            // better-call concatenates baseUrl+url creating a trailing slash that causes 404
            // This middleware restores req.url to the full path before the handler runs
            middleware: (req, _res, next) => {
                req.url = req.originalUrl;
                req.baseUrl = "";
                next();
            },
        }),
        RedisModule,
        UserModule, OrbisAuthModule, ServerModule, TeamModule, ReportModule, BadgeModule, ResourceModule, HytaleVersionModule, DiscoveryModule, ShowcaseModule, AdminModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
