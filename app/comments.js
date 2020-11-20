const router = require("express").Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

router.get("/", async (req, res) => {
    try {
        const comments = await Comment.find();
        res.send(comments);
    } catch (e) {
        res.status(400).send(e);
    };
});

router.post("/", async (req, res) => {
    const token = req.get("Authorization");
    if (!token) {
        return res.status(401).send({ error: "No token presented" });
    };
    const user = await User.findOne({ token });
    if (!user) {
        return res.status(401).send({ error: "Wrong token" });
    };
    const commentData = req.body;
    const post = await Post.findById(commentData.postID);
    if (!post) {
        return res.status(401).send({ error: "Wrong post id" });
    }
    commentData.userID = user._id;
    const comment = new Comment(commentData);
    try {
        await comment.save();
        res.send(comment);
    } catch (e) {
        res.status(400).send(e);
    };
});

module.exports = router;
