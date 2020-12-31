const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Authenticate = require("./authenticate");
const DB_Operations = require("../db/dbOperations");
const { v4: uuidv4 } = require('uuid');
const { pid } = require("process");
const ObjectId = require('mongodb').ObjectID;

const postRouter = express.Router();
const dir_path = "./src/uploads/posts/";
const cloud_dir = "chitchat/";

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => { cb(null, dir_path) },
//     filename: (req, file, cb) => { cb(null, file.originalname) }
// });

// const upload = multer({
//     storage: storage
// });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chitchat",
        public_id: (req, file) => uuidv4()
    }
})

const upload = multer({ storage: storage });



postRouter.post("/posts", Authenticate.verifyJWTToken, upload.array("images", 10), async (req, res) => {
    try {
        const post_data = {
            user: req.user,
            text: req.body.text,
            images: req.files.map(file => {
                return {
                    url: file.path,
                    public_id: file.filename
                }
            }),
            timestamp: Date.now()
        }
        const dbresp = await DB_Operations.insertOne("posts", post_data);
        return res.status(201).send({ message: "Post successfull" })
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            "message": "Some error occurred"
        });
    }
})


postRouter.get("/posts", Authenticate.verifyJWTToken, async (req, res) => {
    try {
        const query = { user: req.user };
        const projection = {};
        const limit = parseInt(req.query.limit);
        const skip = parseInt(req.query.skip);
        const dbresp = await DB_Operations.find("posts", query, projection, limit, skip);
        return res.status(200).send(dbresp);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ "message": "Some error occurred while fetching posts" });
    }
})


postRouter.delete("/posts/:post_id", Authenticate.verifyJWTToken, async (req, res) => {
    try {
        const dbresp = await DB_Operations.findOne("posts", { _id: ObjectId(req.params.post_id) });
        const images = dbresp.images;
        images.forEach(image => {
            cloudinary.uploader.destroy(image.public_id, (error, result) => {
                console.log(error, result);
            })
        });
        await DB_Operations.deleteOne("posts", { _id: ObjectId(req.params.post_id) });
        return res.status(200).send({ "message": "Post deleted" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ "message": "Some error occurred while deleting posts" });
    }
})

postRouter.get("/test1", (req, res) => {
    cloudinary.uploader.destroy("https://res.cloudinary.com/sadller/image/upload/v1609422418/chitchat/e0c44098-ccc2-482d-9da1-0bac098f4b19.jpg", (error, result) => {
        console.log(error, result);
        return res.send(result);
    });
})

postRouter.get("/posts/images/:image_name", (req, res) => {
    try {
        return res.status(200).sendFile(req.params["image_name"], { root: dir_path });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ "message": "Some error occurred while fetching post image" });
    }
})

module.exports = postRouter;
