/* eslint-disable no-underscore-dangle */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const process = require('process');

// environment variables
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'staging';
// process.env.NODE_ENV = 'testing';
// process.env.NODE_ENV = 'production';

// config variables
// eslint-disable-next-line no-unused-vars
const config = require('./config/config');

require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: false,
}));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }),
);

// Switch file storage from development to production
app.use(morgan('dev'));
app.use(
  '/files',
  express.static(path.resolve(__dirname, '.', 'tmp', 'uploads')),
);

// Routes
app.use('/blog', require('./routes/blog'));
app.use('/blog/contributor', require('./routes/contributor/blog'));
app.use('/admin/blog', require('./routes/admin/blog/blog'));

const port = process.env.PORT || global.gConfig.node_port;

app.listen(port, () => {
  console.log(`${global.gConfig.app_name} is listening on port: ${port}`);
});