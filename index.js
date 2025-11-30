import router from './src/routers/index.js';
import express from 'express';
import swaggerjsdoc from 'express-jsdoc-swagger';
import cleanerFile from './src/libs/cleanerFile.js';
import { connectToDatabase } from './src/libs/prisma.config.js';
import { getRedisClient } from './src/libs/redis.config.js';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import cors from 'cors'
const port = 3000;
const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);


const option = {
    info: {
        version: '1.0.0',
        title: 'Employee API',
    },
    servers: [
        {
            url: process.env.BASE_URL
        }
    ],
    filesPattern: ['./src/**/*.js'],
    swaggerUIPath: '/api-docs',
    baseDir: "__dirname"
}
const instance = expressJSDocSwagger(app)(option);

await connectToDatabase();
await getRedisClient()
await cleanerFile();
swaggerjsdoc(app)(option);

app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on ${process.env.BASE_URL}:${port}`);
});