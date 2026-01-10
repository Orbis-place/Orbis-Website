import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis | null = null;

    async onModuleInit() {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            this.logger.warn('REDIS_URL not configured - view deduplication will be disabled');
            return;
        }

        try {
            this.client = new Redis(redisUrl);
            this.client.on('error', (err) => {
                this.logger.error('Redis connection error:', err);
            });
            this.client.on('connect', () => {
                this.logger.log('Connected to Redis');
            });
        } catch (error) {
            this.logger.error('Failed to initialize Redis:', error);
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    /**
     * Check if Redis is available
     */
    isAvailable(): boolean {
        return this.client !== null && this.client.status === 'ready';
    }

    /**
     * Hash an IP address for privacy
     */
    hashIp(ip: string): string {
        return createHash('sha256').update(ip).digest('hex').substring(0, 16);
    }

    /**
     * Check if a view should be counted (unique per IP per post per day)
     * Returns true if this is a new unique view
     */
    async shouldCountView(postId: string, ip: string): Promise<boolean> {
        if (!this.client || !this.isAvailable()) {
            console.log('Redis is not available');
            // If Redis is not available, always count the view (fallback)
            return true;
        }

        try {
            const hashedIp = this.hashIp(ip);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const key = `showcase:view:${postId}:${today}:${hashedIp}`;

            // Try to set key with NX (only if not exists) and EX (expire after 24h)
            const result = await this.client.set(key, '1', 'EX', 86400, 'NX');

            // Returns "OK" if key was set (new view), null if key already exists
            return result === 'OK';
        } catch (error) {
            console.log('azeazeazaz')
            this.logger.error('Redis error in shouldCountView:', error);
            // On error, default to counting the view
            return true;
        }
    }

    /**
     * Generic method to check rate limit
     * Returns true if action is allowed
     */
    async checkRateLimit(key: string, maxAttempts: number, windowSeconds: number): Promise<boolean> {
        if (!this.client || !this.isAvailable()) {
            return true;
        }

        try {
            const current = await this.client.incr(key);

            if (current === 1) {
                await this.client.expire(key, windowSeconds);
            }

            return current <= maxAttempts;
        } catch (error) {
            this.logger.error('Redis rate limit error:', error);
            return true;
        }
    }

    /**
     * Check if a download should be counted (unique per IP per version per day)
     * Returns true if this is a new unique download
     */
    async shouldCountDownload(versionId: string, ip: string): Promise<boolean> {
        if (!this.client || !this.isAvailable()) {
            // If Redis is not available, always count the download (fallback)
            return true;
        }

        try {
            const hashedIp = this.hashIp(ip);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const key = `resource:download:${versionId}:${today}:${hashedIp}`;

            // Try to set key with NX (only if not exists) and EX (expire after 24h)
            const result = await this.client.set(key, '1', 'EX', 86400, 'NX');

            // Returns "OK" if key was set (new download), null if key already exists
            return result === 'OK';
        } catch (error) {
            this.logger.error('Redis error in shouldCountDownload:', error);
            // On error, default to counting the download
            return true;
        }
    }
}
