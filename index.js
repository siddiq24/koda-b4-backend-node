import router from './src/routers/index.js';
import express from 'express';
import swaggerjsdoc from 'express-jsdoc-swagger';
import cleanerFile from './src/libs/cleanerFile.js';
const port = 3000;

const app = express();
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

cleanerFile()
swaggerjsdoc(app)(option);

app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on ${process.env.BASE_URL}:${port}`);
});