const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const { rawListeners } = require("../models/Blogpost.model");
const Blogpost = require("../models/Blogpost.model");

router.get("/create", isLoggedIn, (req, res) => {
  res.render("post/post-create");
});

router.post("/create", isLoggedIn, (req, res) => {
  const { title, text, startVacation, endVacation, timestamps } = req.body;

  Blogpost.create({ text, title, author: req.session.user._id }).then(
    (createdPost) => {
      console.log(createdPost);
      res.redirect("/profile");
    }
  );
});

router.get("/:id", (req, res) => {
  Blogpost.findById(req.params.id)
    .populate("author")
    .then((thePost) => {
      console.log("thePost:", thePost);
      //Check if is author then showing the edit button
      let isAuthor = false;
      if (req.session.user) {
        if (req.session.user._id.toString() === thePost.author._id.toString()) {
          isAuthor = true;
        }
      }
      res.render("post/single-post", { post: thePost, isAuthor });
    });
});

router.get("/:id/edit", isLoggedIn, (req, res) => {
  Blogpost.findById(req.params.id).then((thePost) => {
    //If not the author of post then back to the post page
    if (req.session.user._id.toString() !== thePost.author._id.toString()) {
      return res.redirect(`/post/${thePost.id}`);
    }
    res.render("post/edit-single-post", { post: thePost });
  });
});

router.post("/:id/edit", isLoggedIn, (req, res) => {
  const { startVacation, endVacation, title, image, text } = req.body;
  //Check if the post is exist
  Blogpost.findById(req.params.id).then((singlePost) => {
    console.log("singlePost:", singlePost);
    if (!singlePost) {
      return res.redirect("/");
    }

    //If not the author of post then back to the post page
    if (req.session.user._id.toString() !== singlePost.author._id.toString()) {
      return res.redirect(`/post/${singlePost._id}`);
    }

    Blogpost.findByIdAndUpdate(singlePost._id, {
      startVacation,
      endVacation,
      title,
      image,
      text,
    }).then(() => {
      res.redirect(`/post/${singlePost._id}`);
    });
  });
});

module.exports = router;
