var mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.ATLAS_URI_BLOG, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const { connection } = mongoose;
connection.once('open', () => {
  console.log('MongoDB Atlas database CRYPTIC-ACTIVIST-BLOG connection established successfully.');
});

module.exports = exports = mongoose;