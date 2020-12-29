const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");
const postRouter = require("./routes/posts");

PORT = process.env.PORT || 8080;


app = express();
app.use(cors());
app.use(express.json());


app.listen(PORT, ()=>{
    console.log("Listening at port ",PORT);
})


app.all("/", (req,res,next)=>{
    logger.info(`Route : ${req.originalUrl}`);
    next();
})

// ======================================> Routes <============================================================
app.use(usersRouter);
app.use(postRouter);
//================================================================================================================


app.get("/test", (req, res) => {
    const resp = {
        "message": "Test successfull"
    }
    res.status(200).send(resp);
})