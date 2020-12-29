var jwt = require('jsonwebtoken');

function generateJWTToken(data){
    if(data && data!=undefined){
        return jwt.sign(data,process.env.JWT_TOKEN_SECRET,{expiresIn: "2d"});
    }
    return null;
}


async function verifyJWTToken(req, res, next){
    try{
        if(!req.headers["authorization"] || req.headers["authorization"]===""){
            return res.status(400).send({
                "message": "Invalid Authorization header"
            })
        }else{
            const token = req.headers["authorization"].split(" ")[1];
            if(token===undefined || token===null){
                return res.status(400).send({
                    "message": "Invalid Authorization header"
                })
            }
            try{
                const decoded = await jwt.verify(token,process.env.JWT_TOKEN_SECRET);
                req.user = decoded.user
                next();
            }catch(err){
                console.log(err);
                res.status(403).send(err)
            }
        }
    }catch(err){
        console.log(err);
        res.status(500).send({
            "message": "Some error occurred"
        })
    }
}


module.exports = {generateJWTToken, verifyJWTToken};