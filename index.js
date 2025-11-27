const express = require('express');
const app = express();
const port = 3000;
const router = require('./src/routers');
const swaggerjsdoc = require('express-jsdoc-swagger');
const cleanerFile = require('./src/libs/cleanerFile');

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
    baseDir: __dirname
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