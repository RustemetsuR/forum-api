const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const config = require("../config");
const { nanoid } = require("nanoid");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "-token -__v");
        res.send(posts);
    } catch (e) {
        res.status(500).send(e);
    };
});


router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comments = await Comment.find({postID: req.params.id}).populate("userID", "-token -__v");
        const data = {
            post: post,
            comments: comments,
        }
        res.send(data);
    } catch (e) {
        res.status(500).send(e);
    };
});

router.post("/", upload.single("image"), async (req, res) => {
    const token = req.get("Authorization");
    if (!token) {
        return res.status(401).send({ error: "No token presented" });
    };
    const user = await User.findOne({ token });
    if (!user) {
        return res.status(401).send({ error: "Wrong token" });
    };

    const postData = req.body;
    postData.user = user._id;
    if (req.file) {
        postData.image = req.file.filename;
    };
    if (postData.image === '' && postData.description === '') return res.status(400).send({ error: "Image or Description is empty" });
    const post = new Post(postData);
    try {
        await post.save();
        res.send(post);
    } catch (e) {
        res.status(400).send(e);
    };
});

module.exports = router;