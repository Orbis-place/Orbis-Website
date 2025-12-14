import { Module } from '@nestjs/common';
import { HytaleVersionController } from './hytale-version.controller';

@Module({
    controllers: [HytaleVersionController],
})
export class HytaleVersionModule { }
