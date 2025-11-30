import { createClient } from '@redis/client';

let client;

export function getRedisClient() {
    if (!client) {
        client = createClient({
            url: process.env.REDIS_URL
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        client.connect()
            .then(() => console.log('Redis connected successfully'))
            .catch(err => console.error('Redis connected rejected', err));
    }

    return client;
}
