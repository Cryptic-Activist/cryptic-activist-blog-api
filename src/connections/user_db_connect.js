var mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.ATLAS_URI_USER, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const { connection } = mongoose;
connection.once('open', () => {
  console.log('MongoDB Atlas database CRYPTIC-ACTIVIST-USER connection established successfully.');
});

module.exports = exports = mongoose;