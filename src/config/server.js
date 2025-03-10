require('dotenv').config(); // Carrega as variáveis do .env

const port = process.env.PORT || 8080;

const express = require('express'); 
const { urlencoded, json } = require('body-parser');
const allowCors = require('./cors');
const queryParser = require('express-query-int');

const server = express();

server.use(urlencoded({ extended: true }));
server.use(json());
server.use(allowCors);

server.listen(port, function() {
    console.log(`BACKEND is running on port ${port}.`);
});

module.exports = server;