/* eslint-disable no-underscore-dangle */
/* eslint-disable array-callback-return */
const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const multerConfig = require('../../../config/multer');

const authMiddleware = require('../../../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Post = require('../../../models/blog/Post');
const PostCover = require('../../../models/blog/PostCover');

// Check if Podcast slug is valid
app.get('/validation/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const postList = [];
  const date = new Date();
  const fullSlug = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}/${slug}`;
  console.log('fullSlug:', fullSlug);
  Post.find({
    slug: fullSlug,
  })
    .then((posts) => {
      posts.map((post) => {
        postList.push({
          id: post.id,
          type: post.type,
          slug: post.slug,
          category: post.category,
          title: post.title,
          description: post.description,
          tags: post.tags,
          publishedOn: post.publishedOn,
          updateOn: post.updateOn,
        });
      });
      console.log('posts:', postList);
      let valid = true;
      if (postList.length > 0) {
        valid = false;
        res.json({
          valid,
        });
      } else if (postList.length === 0) {
        res.json({
          valid,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/publish', async (req, res) => {
  const {
    isSlugValid,
    type,
    category,
    title,
    slug,
    tags,
    content,
    cover,
    author,
  } = req.body;
  console.log('uploaded cover:', cover)

  const errors = [];
  if (!isSlugValid
    || !type
    || !category
    || tags.length === 0
    || !title
    || !slug
    || !content) {
    errors.push({
      errorMsg: 'Please enter all fields.',
    });
  }
  console.log('type:', type);
  console.log('errors.length:', errors.length);
  if (errors.length > 0) {
    res.json({
      error: errors,
    });
  } else {
    const id = uuidv4();
    const publishedOn = Date.now();
    const updatedOn = null;
    console.log('BEFORE IF isSlugValid:', isSlugValid)
    if (isSlugValid) {
      const date = new Date();
      const fullSlug = `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}/${slug}`;
      console.log('fullSlug:', fullSlug);
      console.log('publishedOn:', publishedOn);
      const newPost = new Post({
        id,
        type,
        isSlugValid,
        category,
        title,
        slug: fullSlug,
        cover,
        tags,
        comments: [],
        content,
        author,
        publishedOn,
        updatedOn,
      });
      newPost
        .save()
        .then((post) => {
          console.log('post:', {
            msg: 'Blog Post successfully published!',
            _id: post._id,
          });
          res.status(201).send(post._id);
        })
        .catch((err) => {
          res.json({
            errorMsg: err,
          });
        });
    } else {
      res.json({
        errorMsg: 'Slug is invalid',
      });
    }
  }
});

app.post('/publish/cover', multer(multerConfig).single('file'), async (req, res) => {
  const {
    originalname: name,
    size,
    key,
    location: url = '',
  } = req.file;
  const id = uuidv4();
  console.log('id:', id);

  const cover = await PostCover.create({
    id,
    name,
    size,
    key,
    url,
  });

  return res.json(cover);
});

app.post('/set/global-variable', async (req, res) => {
  const {
    type,
    title,
  } = req.body;
  global.gConfigMulter.type = type;
  global.gConfigMulter.title = title;
  global.gConfigMulter.folder_name = global.gConfigMulter.title;
  global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`;
  res.status(200).send({
    ok: true,
  });
});

// Update Podcast Info
app.put('/update/:id', (req, res) => {
  const {
    slug,
    category,
    title,
    content,
    tags,
  } = req.body;
  const { id } = req.params;
  console.log('SLUG:', slug);
  Post.updateOne({
    id,
  }, {
    slug,
    category,
    title,
    content,
    tags,
    updatedOn: Date.now(),
  }, {
    runValidators: true,
  })
    .then((post) => {
      console.log('res:', {
        msg: 'Post details has been successfully updated.',
        id,
        slug,
        category,
        title,
        content,
        tags,
        updated: true,
        updatedOn: post.updatedOn,
      });
      res.json({
        msg: 'Post details has been successfully updated.',
        id,
        category,
        title,
        content,
        tags,
        updated: true,
        updatedOn: post.updatedOnOn,
      });
    })
    .catch((err) => {
      res.json({
        errorMsg: err,
      });
    });
});

// Delete Podcast
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  Post.deleteOne({
    id,
  }).then(() => {
    res.json({
      msg: ' Blog Post deleted successfully!',
    });
  }).catch((err) => {
    res.json({
      errorMgs: err,
    });
  });
});

app.delete('/delete/cover/:id', async (req, res) => {
  const { id } = req.params;
  const coverFile = await PostCover.findOne({
    _id: id
  });
  console.log('id:', id);
  console.log('coverFile:', coverFile);
  await coverFile.remove();
  return res.send({
    msg: 'Blog Post cover file successfully deleted',
  });
});

module.exports = app;
