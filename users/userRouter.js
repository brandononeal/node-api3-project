const express = require("express");
const router = express.Router();

const User = require("./userDb");
const Post = require("../posts/postDb");

router.post("/", validateUser, (req, res) => {
  User.insert(req.body)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "error creating the user" });
    });
});

router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const newPost = { ...req.body, user_id: req.params.id };

  Post.insert(newPost)
    .then((post) => {
      res.status(201).json(post);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "error creating the post" });
    });
});

router.get("/", (req, res) => {
  User.get(req.query)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ message: "the users could not be retrieved" });
    });
});

router.get("/:id", validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get("/:id/posts", validateUserId, (req, res) => {
  User.getUserPosts(req.params.id)
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      console.log(err.message);
      res
        .status(500)
        .json({ message: "the user posts could not be retrieved" });
    });
});

router.delete("/:id", validateUserId, (req, res) => {
  User.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: "the user has been removed" });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ message: "error removing the user" });
    });
});

router.put("/:id", validateUserId, (req, res) => {
  if (!req.body.name) {
    res.status(400).json({ message: "please provide a name for the user" });
  }

  User.update(req.params.id, req.body)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ message: "error updating the user" });
    });
});

// custom middleware

function validateUserId(req, res, next) {
  User.getById(req.params.id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(400).json({ message: "invalid user id" });
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ message: "error retrieving the user" });
    });
}

function validateUser(req, res, next) {
  if (!req.body) {
    res.status(400).json({ message: "missing user data" });
  } else if (!req.body.name) {
    res.status(400).json({ message: "missing required name field" });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  if (!req.body) {
    res.status(400).json({ message: "missing post data" });
  } else if (!req.body.text) {
    res.status(400).json({ message: "missing required text field" });
  } else {
    next();
  }
}

module.exports = router;
