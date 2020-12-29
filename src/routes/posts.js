const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Authenticate = require("./authenticate");
const DB_Operations = require("../db/dbOperations");
const ObjectId = require('mongodb').ObjectID;

const postRouter = express.Router();
const dir_path = "./src/uploads/posts/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, dir_path)},
    filename: (req, file, cb) => { cb(null, file.originalname) }
});

const upload = multer({
    storage: storage
});



postRouter.post("/posts", Authenticate.verifyJWTToken, async(req, res) => {
    upload.array("images",10)(req, res, async err => {
        if(err){
            return res.status(500).send({
                "message": "Some error occurred while uploading"
            })
        }
        const post_data = {
            user: req.user,
            text: req.body.text,
            images: req.files.map(file => file.originalname),
            timestamp: Date.now()
        }
        try{
            const dbresp = await DB_Operations.insertOne("posts",post_data);
            return res.status(201).send({message: "Post successfull"})
        }catch(err){
            console.log(err);
            return res.status(500).send({
                "message": "Some error occurred"
            });
        }
    })
})

postRouter.get("/posts", Authenticate.verifyJWTToken, async (req, res) => {
    try{
        const query = {user: req.user};
        const projection = {};
        const limit = parseInt(req.query.limit);
        const skip = parseInt(req.query.skip);
        const dbresp = await DB_Operations.find("posts",query,projection,limit,skip);
        return res.status(200).send(dbresp);
    }catch(err){
        console.log(err);
        return res.status(500).send({"message": "Some error occurred while fetching posts"});
    }
})


postRouter.delete("/posts/:post_id" , Authenticate.verifyJWTToken, async (req, res) => {
    try{
        const dbresp = await DB_Operations.findOne("posts",{_id : ObjectId(req.params.post_id)});
        const images = dbresp.images;
        images.forEach(image => {
            fs.unlink(dir_path+image, err => {
                if(err) throw err;
            })
        });
        await DB_Operations.deleteOne("posts",{_id : ObjectId(req.params.post_id)});
        return res.status(200).send({"message": "Post deleted"});
    }catch(err){
        console.log(err);
        return res.status(500).send({"message": "Some error occurred while deleting posts"});
    }
})

postRouter.get("/posts/images/:image_name", (req, res) => {
    try{
        return res.status(200).sendFile(req.params["image_name"],{root: dir_path});
    }catch(err){
        console.log(err);
        return res.status(500).send({"message": "Some error occurred while fetching post image"});
    }
})

module.exports = postRouter;


