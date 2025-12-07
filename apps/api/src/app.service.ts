import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class AppService {

    constructor() {
    }

    async getHello(): Promise<string> {
        const user = await prisma.user.findFirst();

        console.log(user);
        return 'Hello World!';
    }
}
