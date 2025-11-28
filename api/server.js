import app from '../src/index.js';

const server = (req, res) => {
    app(req, res);
};

export default server;