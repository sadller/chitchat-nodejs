const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");
const postRouter = require("./routes/posts");



app = express();
app.use(cors());
app.use(express.json());


app.listen(process.env.PORT || 3000, ()=>{
    console.log("Listening at port ",process.env.PORT || 3000);
})


app.all("/", (req,res,next)=>{
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