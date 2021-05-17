const jwt = require('jsonwebtoken'); //jwt
const UserModel = require('../models/user.model'); // model utilisateur


// verification du token présenté par l'utilisateur
module.exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt; //recuperation du token de l'utilisateur
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => { //verification et decodage du token présenté
            if (err) {
                res.locals.user = null;
                res.cookie('jwt', '', { maxAge: 1 });
                next();
            } else {
                let user = await UserModel.findById(decodedToken.id);
                res.locals.user = user;
                console.log(res.locals.user);
                next();
            }
        })
    } else {
        console.log("No token");
        res.locals.user = null;
        //next();
    }
}

// voir a sa nouvelle venue s'il possède deja un jeton et le rediriger
module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err);
                next();
            } else {
                console.log(decodedToken.id);
                res.status(200).json({"user ":decodedToken.id})
                next();
            }
        })
    } else {
        console.log("No token");
    }

}