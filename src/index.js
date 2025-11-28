import express from 'express';
import router from './routers/index.js';
import swaggerjsdoc from 'express-jsdoc-swagger';
import cleanerFile from './libs/cleanerFile.js';

const app = express();
const option = {
    info: {
        version: '1.0.0',
        title: 'Employee API',
    },
    servers: [
        { url: process.env.BASE_URL }
    ],
    filesPattern: ['./src/**/*.js'],
    swaggerUIPath: '/api-docs',
    baseDir: "__dirname"
};

cleanerFile();
swaggerjsdoc(app)(option);

app.use(express.json());
app.use(express.text());
app.use(express.static('/tmp/uploads'));
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

export default app;