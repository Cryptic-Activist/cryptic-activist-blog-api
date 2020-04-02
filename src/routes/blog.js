/* eslint-disable array-callback-return */
const express = require("express");

const app = express();
const router = express.Router();
const cors = require("cors");
const uuidv4 = require("uuid/v4");
const multer = require("multer");
const multerConfig = require("../config/multer");

// const authMiddleware = require('../middleware/auth');

app.use(cors());
// app.use(authMiddleware);

const Post = require("../models/blog/Post");
const PostComment = require("../models/blog/PostComment");
const PostCommentReply = require("../models/blog/PostCommentReply");
const PostCover = require("../models/blog/PostCover");
const User = require("../models/user/User");
const UserProfileImage = require("../models/user/UserProfileImage");

const getAuthor = async (authorId) => {
  const user = await User.findOne({
    _id: authorId
  });
  const userImage = await UserProfileImage.findOne({
    _id: user.profileImage
  });

  return {
    socialMedia: user.socialMedia,
    posts: user.posts,
    following: user.following,
    followers: user.followers,
    _id: user._id,
    id: user.id,
    name: user.name,
    email: user.email,
    quote: user.quote,
    username: user.username,
    password: user.password,
    profileImage: userImage,
    isAdmin: user.isAdmin,
    origin: user.origin,
    createdOn: user.createdOn,
    __v: user.__v
  };
};

const getCover = async (coverId) => {
  try {
    const cover = await PostCover.findOne({
      _id: coverId
    });
    return cover;
  } catch (err) {
    console.log(err);
    return {};
  }
};

app.get("/get/comments/:postId", async (req, res) => {
  const { postId } = req.params;

  PostComment.find({
    post: postId
  })
    .populate({
      path: "post",
      model: Post
    })
    .populate({
      path: "author",
      model: User,
      populate: {
        path: "profileImage",
        model: UserProfileImage
      }
    })
    .then((comment) => {
      res.json(comment);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/", async (req, res) => {
  const pagination = req.query.pagination
    ? parseInt(req.query.pagination, 10)
    : 10;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const postsList = [];
  Post.find()
    .skip((page - 1) * pagination)
    .limit(pagination)
    .populate("cover")
    .then((posts) => {
      posts.map((post) =>
        postsList.push({
          id: post.id,
          title: post.title,
          category: post.category,
          content: post.content,
          slug: post.slug,
          cover: post.cover,
          type: post.type,
          author: post.author,
          publishedOn: post.publishedOn,
          updateOn: post.updateOn
        })
      );
      // console.log('postsList:', posts);
      res.status(200).send(postsList);
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get("/short", async (req, res) => {
  const pagination = req.query.pagination
    ? parseInt(req.query.pagination, 10)
    : 10;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const postsList = [];
  Post.find()
    .sort({ publishedOn: -1 })
    .skip((page - 1) * pagination)
    .limit(6)
    .populate("cover")
    .then((posts) => {
      if (posts.lenth === 0) {
        res.status(200).send({
          found: false
        });
      } else if (posts.length > 0) {
        posts.map((post) => {
          postsList.push({
            id: post.id,
            title: post.title,
            slug: post.slug,
            category: post.category,
            cover: post.cover,
            publishedOn: post.publishedOn,
            updateOn: post.updateOn
          });
        });

        res.status(200).send(postsList);
      }
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get("/home/main-post", async (req, res) => {
  let postsList = [];
  Post.find()
    .sort("-howManyRead")
    .limit(5)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      posts.map((post) => {
        postsList.push({
          title: post.title,
          category: post.category,
          publishedOn: post.publishedOn,
          cover: {
            url: post.cover.url
          }
        });
      });
      res.json(postsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/home/news", async (req, res) => {
  let postsList = [];
  Post.find({
    type: "News"
  })
    .sort({ publishedOn: -1 })
    .limit(6)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      posts.map((post) => {
        postsList.push({
          title: post.title,
          category: post.category,
          publishedOn: post.publishedOn,
          cover: {
            url: post.cover.url
          }
        });
      });
      res.json(postsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/home/most-recent-videos", async (req, res) => {
  let postsList = [];
  Post.find({
    type: "Video"
  })
    .sort({ publishedOn: -1 })
    .limit(4)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      posts.map((post) => {
        postsList.push({
          title: post.title,
          category: post.category,
          publishedOn: post.publishedOn,
          cover: {
            url: post.cover.url
          }
        });
      });
      res.json(postsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/home/tutorials", async (req, res) => {
  let postsList = [];
  Post.find({
    type: "Tutorial"
  })
    .sort({ publishedOn: -1 })
    .limit(6)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      posts.map((post) => {
        postsList.push({
          title: post.title,
          category: post.category,
          publishedOn: post.publishedOn,
          cover: {
            url: post.cover.url
          }
        });
      });
      res.json(postsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/home/articles", async (req, res) => {
  let postsList = [];
  Post.find({
    type: "Article"
  })
    .sort({ publishedOn: -1 })
    .limit(6)
    .populate({
      path: "cover",
      model: PostCover
    })
    .populate({
      path: "author",
      model: User,
      populate: {
        path: "profileImage",
        model: UserProfileImage
      }
    })
    .then((posts) => {
      posts.map((post) => {
        postsList.push({
          title: post.title,
          category: post.category,
          publishedOn: post.publishedOn,
          cover: {
            url: post.cover.url
          },
          author: {
            name: post.author.name,
            profileImage: {
              url: post.author.profileImage.url
            }
          }
        });
      });
      res.json(postsList);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/most/recent/post", async (req, res) => {
  Post.find()
    .sort({ publishedOn: -1 })
    .limit(1)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/get/top-authors", async (req, res) => {
  User.find()
    .limit(3)
    .populate({
      path: "profileImage",
      model: UserProfileImage
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/cover", async (req, res) => {
  const { title } = req.params;

  const postCover = await Post.find({
    title
  });

  return res.json(postCover);
});

app.post("/get/user/activities", (req, res) => {
  const { posts } = req.body;
  Post.find({ _id: { $in: posts } })
    .populate({
      path: "cover",
      model: PostCover
    })
    .sort({ publishedOn: -1 })
    .limit(6)
    .then((activities) => {
      res.status(200).send(activities);
    })
    .catch((err) => {
      res.json(err);
    });
});

// Get Podcast by slug
app.get("/get/slug/:year/:month/:day/:slug", (req, res) => {
  const { year, month, day, slug } = req.params;

  const fullSlug = `${year}/${month}/${day}/${slug}`;

  Post.findOne({
    slug: fullSlug
  })
    .populate({
      path: "cover",
      model: PostCover
    })
    .populate({
      path: "author",
      model: User,
      populate: {
        path: "profileImage",
        model: UserProfileImage
      }
    })
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/get/category/:category", async (req, res) => {
  const { category } = req.params;
  const postsList = [];
  const pagination = req.query.pagination
    ? parseInt(req.query.pagination, 10)
    : 10;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;

  let newCategory;
  if (category.indexOf("-") !== -1) {
    newCategory = category.split("-").join(" ");
  } else if (category.indexOf("-") === -1) {
    newCategory = category;
  }
  Post.find(
    { category: { $regex: `${newCategory}`, $options: "i" } },
    (err, docs) => {
      console.log("err:", err);
    }
  )
    // .sort({ publishedOn: -1 })
    .skip((page - 1) * pagination)
    .limit(pagination)
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      posts.map((post) => {
        console.log("post title:", post.title);
        console.log("post slug:", post.slug);
        postsList.push({
          title: post.title,
          slug: post.slug,
          category: post.category,
          cover: post.cover,
          publishedOn: post.publishedOn,
          updateOn: post.updateOn
        });
      });
      res.status(200).send(postsList);
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get(
  "/get/category/newest/:category/:year/:month/:day/:slug",
  async (req, res) => {
    const { category } = req.params;

    Post.find(
      { category: { $regex: `${category}`, $options: "i" } },
      (err, docs) => {}
    )
      .populate({
        path: "cover",
        model: PostCover
      })
      .populate({
        path: "author",
        model: User,
        populate: {
          path: "profileImage",
          model: UserProfileImage
        }
      })
      .limit(3)
      .then((post) => {
        res.json(post);
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

app.post("/comments/", async (req, res) => {
  const { postId } = req.body;

  console.log("comments:", postId);

  // #####################################################
  // #######                                       #######
  // ####### NEED TO CONNECT TO A DIFFENT DATABASE #######
  // #######     TO PROPERLY POPULATE 'author'     #######
  // #######                                       #######
  // #####################################################

  PostComment.find({
    post: postId
  })
    .populate({
      path: "author",
      model: User,
      populate: {
        path: "profileImage",
        model: UserProfileImage
      }
    })
    .then((commentsArray) => {
      console.log("commentsArray:", commentsArray);
      res.json(commentsArray);
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get("/get/categories/newest/:number", async (req, res) => {
  const { number } = req.params;
  const postsList = [];
  Post.find()
    .sort({ publishedOn: -1 })
    .then((posts) => {
      posts.map((post) => {
        postsList.push(post.category);
      });
      const uniquePostsList = postsList.filter((v, i, a) => a.indexOf(v) === i);
      res.status(200).send(uniquePostsList.splice(0, number));
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get("/comments", (req, res) => {
  const { postId } = req.query;
  console.log("postId", postId);
});

app.get("/get/tag/:tag", async (req, res) => {
  const { tag } = req.params;
  const pagination = req.query.pagination
    ? parseInt(req.query.pagination, 10)
    : 10;
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const postsList = [];
  let newTag;
  if (tag.indexOf("-") !== -1) {
    newTag = tag.split("-").join(" ");
  } else if (tag.indexOf("-") === -1) {
    newTag = tag;
  }

  Post.find({
    tags: newTag
  })
    .skip((page - 1) * pagination)
    .limit(pagination)
    .sort()
    .populate({
      path: "cover",
      model: PostCover
    })
    .then((posts) => {
      if (posts.length === 0) {
        res.status(200).send([]);
      } else if (posts.length > 0) {
        posts.map((post) => {
          postsList.push({
            title: post.title,
            slug: post.slug,
            category: post.category,
            cover: post.cover,
            publishedOn: post.publishedOn,
            updateOn: post.updateOn
          });
        });
        res.status(200).send(postsList);
      }
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.put("/update/post/how-many-read", (req, res) => {
  const { slug, howManyReadNumber } = req.body;

  Post.updateOne(
    {
      slug
    },
    {
      howManyRead: howManyReadNumber + 1
    },
    {
      runValidators: true
    }
  )
    .then(() => {
      res.status(200).send({ howManyReadNumber: howManyReadNumber + 1 });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = app;
