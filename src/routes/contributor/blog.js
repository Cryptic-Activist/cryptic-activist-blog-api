const express = require("express");

const app = express();
const cors = require("cors");
const uuidv4 = require("uuid/v4");

app.use(cors());

const User = require("../../models/user/User");
const UserProfileImage = require("../../models/user/UserProfileImage");
const Post = require("../../models/blog/Post");
const Comment = require("../../models/blog/PostComment");
const CommentReply = require("../../models/blog/PostCommentReply");

app.post("/comment/post", async (req, res) => {
  const { postId, userId, content } = req.body;

  const errors = [];
  if (!postId || !userId || !content) {
    errors.push({
      errorMsg: "Please enter all fields."
    });
  }

  if (errors.length > 0) {
    res.json({
      error: errors
    });
  } else {
    const id = uuidv4();
    const publishedOn = Date.now();
    const updatedOn = null;
    let commentObj;
    let commentId;
    const newComment = new Comment({
      id,
      author: userId,
      post: postId,
      content,
      publishedOn,
      updatedOn,
      likes: 0,
      dislikes: 0,
      replies: []
    });
    await newComment
      .save()
      .then((comment) => {
        commentObj = comment;
        commentId = comment._id;
      })
      .catch((err) => {
        console.log("err:", err);
        res.json({
          err
        });
      });

    try {
      const PostObj = await Post.findOne({
        _id: postId
      });

      let postObjComments = await PostObj.comments;
      console.log("commentId:", commentId);

      const CommentObj = await Comment.findOne({
        _id: commentId
      }).populate({
        path: "author",
        model: User,
        populate: {
          path: "profileImage",
          model: UserProfileImage
        }
      });

      postObjComments.push(commentId);
      await Post.updateOne(
        {
          _id: postId
        },
        {
          comments: postObjComments
        },
        {
          runValidation: true
        }
      );
      res.status(200).send(CommentObj);
    } catch (err) {
      console.log("err:", err);
      res.json({
        err
      });
    }
  }
});

app.post("/comment/reply", async (req, res) => {
  const { postId, commentId, userId, content } = req.body;

  console.log("commentId:", commentId);

  const errors = [];
  if (!postId || !userId || !content || !commentId) {
    errors.push({
      errorMsg: "Please enter all fields."
    });
  }

  if (errors.length > 0) {
    res.json({
      error: errors
    });
  } else {
    const id = uuidv4();
    const publishedOn = Date.now();
    const updatedOn = null;
    let commentIdVar;
    const newCommentReply = new CommentReply({
      id,
      author: userId,
      post: postId,
      comment: commentId,
      content,
      publishedOn,
      updatedOn,
      likes: 0,
      dislikes: 0
    });
    await newCommentReply
      .save()
      .then((comment) => {
        commentIdVar = comment._id;
      })
      .catch((err) => {
        console.log("err:", err);
        res.json({
          err
        });
      });

    try {
      const PostObj = await Post.findOne({
        _id: postId
      });
      const CommentObj = await Comment.findOne({
        _id: commentId
      });
      let commentObjReplies = await CommentObj.replies;
      console.log("commentObjReplies:", commentObjReplies);
      commentObjReplies.push(commentIdVar);
      console.log("commentObjReplies:", commentObjReplies);
      await Comment.updateOne(
        {
          _id: postId
        },
        {
          replies: commentObjReplies
        },
        {
          runValidation: true
        }
      );
      res.status(200).send({ ok: true });
    } catch (err) {
      console.log("err:", err);
      res.json({
        err
      });
    }
  }
});

app.get("/verify/exist/post/:postId", async (req, res) => {
  const { postId } = req.params;

  const errors = [];
  if (!postId) {
    errors.push({
      errorMsg: "Please enter all fields."
    });
  }

  Post.findOne({
    _id: postId
  })
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

app.get("/verify/exist/comment/:commentId", async (req, res) => {
  const { commentId } = req.params;

  const errors = [];
  if (!commentId) {
    errors.push({
      errorMsg: "Please enter all fields."
    });
  }

  Comment.findOne({
    _id: commentId
  })
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((err) => {
      res.json({
        err
      });
    });
});

module.exports = app;
