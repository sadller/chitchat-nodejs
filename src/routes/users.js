const express = require("express");
var bcrypt = require('bcryptjs');
const DB_Operations = require("../db/dbOperations");
const Authenticate = require("./authenticate");

const usersRouter = express.Router();

function isValidUserSignupData(data){
    if(!data.firstName || data.firstName.length===0 || !data.lastName || data.lastName.length===0 || 
        !data.gender || data.lastName.gender===0 || !data.email || data.lastName.email===0 || 
        !data.password || data.password.length===0 || (new Date()-data.dob)<10){
            return false;
        }
    return true;
}



usersRouter.post("/signup", async(req, res)=> {
    if(isValidUserSignupData(req.body)){
        try{
            const resp = await DB_Operations.findOne("users",{email:req.body.email},{password:0});
            if(resp===null){
                const user = {
                    ...req.body,
                    password: bcrypt.hashSync(req.body.password,8)
                }
                const dbresp = await DB_Operations.insertOne("users",user);
                const token = Authenticate.generateJWTToken({"user": user.email})
                return res.status(201).send({
                    "message": "User created",
                    "token": token
                });
            }else{
                return res.status(400).send({
                    "message": "User already exists"
                })
            }
        }catch(err){
            console.log(err);
            return res.status(500).send({
                "message": "Some error occurred"
            });
        }
    }else{
        return res.status(400).send({
            "message": "Invalid request"
        })
    }
})


usersRouter.post("/login", async(req, res) => {
    try{ 
        if(!req.body.username || !req.body.password){
            return res.status(400).send({
                "message": "Invalid request"
            })
        } 
        const {username, password} = req.body;
        const dbresp = await DB_Operations.findOne("users",{email: username});
        
        if(dbresp===null){
            return res.status(404).send({
                "message": "User not found"
            })
        }else{
            try{
                resp = await bcrypt.compare(password,dbresp.password);
                if(resp){
                    const token = Authenticate.generateJWTToken({"user": username})
                    return res.status(200).send({
                        "message": "Login successfull",
                        "token": token
                    });
                }else{
                    return res.status(401).send({
                        "message": "Unautorized"
                    })
                }
            }catch(err){
                console.log(err);
                return res.status(500).send({
                    "message": "Some error occurred"
                })
            }
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({
            "message": "Some error occurred"
        })
    }
})



usersRouter.get("/decodeuser",Authenticate.verifyJWTToken, (req,res,next) => {
    res.status(200).send({"Success": req.user});
})



module.exports = usersRouter;