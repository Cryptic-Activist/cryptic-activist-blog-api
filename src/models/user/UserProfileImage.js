/* eslint-disable no-console */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const {
  promisify,
} = require('util');

var db2 = mongoose.createConnection(process.env.ATLAS_URI_USER, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});


const s3 = new aws.S3();

const UserProfileImageSchema = new mongoose.Schema({
  id: String,
  name: String,
  size: Number,
  key: String,
  url: String,
  origin: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserProfileImageSchema.pre('save', function () {
  if (this.origin !== 'Github') {
    if (!this.url) {
      this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
  }
});

UserProfileImageSchema.pre('remove', function () {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key,
      })
      .promise()
      .then((response) => {
        console.log(response.status);
      })
      .catch((response) => {
        console.log(response.status);
      });
  }
  return promisify(fs.unlink)(
    path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key),
  );
});

module.exports = db2.model('UserProfileImage', UserProfileImageSchema);
