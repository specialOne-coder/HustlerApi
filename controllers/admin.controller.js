const AdminModel = require('../models/admin.model'); // admin model
const ObjectID = require('mongoose').Types.ObjectId; // pour les ids
const UserModel = require('../models/user.model'); // user model
const { signUpErrors, signInErrors } = require('../utils/error.utils'); // gestion des erreurs
const jwt = require('jsonwebtoken'); // jwt
const maxAge = 3 * 24 * 60 * 1000; // cookie life
const bcrypt = require('bcrypt'); // cryptage du mot de passe modifié
const nodemailer = require('nodemailer'); // envoi de mail
// auth 

// jwt token creation function
const createToken = (id) => { // encodage avec l'id de l'utilisateur et la clé
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
}

// inscription
module.exports.signUp = async (req, res) => {
    const { pseudo, email, password } = req.body; // inputs
    try {
        const user = await AdminModel.create({ pseudo, email, password }); // save user
        res.status(201).json({ success: true }); // renvoi de l'id de l'utilisateur inscrit
    } catch (err) {
        const errors = signUpErrors(err);
        res.status(200).send({ errors });
        //console.log(err);
    }
}

// connexion
module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await AdminModel.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ success: true });
    } catch (err) {
        const errors = signInErrors(err);
        res.status(200).send({ errors });
        console.log(err);
    }
}

// mot de passe oublié

const sendEmail = (email, code) => { // envoi un email 
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'frdndattivi@gmail.com',
            pass: 'ferdinand8918',
        }
    });

    var mailOptions = {
        from: 'frdndattivi@gmail.com',
        to: email,
        subject: 'Mot de passe oublié',
        text: code,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log(err);
        else console.log('Email envoyé ' + info.response);
    })
}

module.exports.sendEmailAndUpdateCode = async (req, res) => { // met a jour le mot code apres envoi du mail

    const { email } = req.body;
    const user = await AdminModel.forgetPasswordWithEmail(email);
    const codeSend = Math.floor(100000 + Math.random() * 900000);
    await sendEmail(String(email), String(codeSend));
    await AdminModel.findOneAndUpdate(
        { _id: user._id },
        {
            $set: {
                code: codeSend,
            }
        }, { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
            if (!err) return res.status(200).json({ success: true });
            else return res.status(200).json({ erreur: err })
        }
    );
}

module.exports.codeVerifyAndUpdatePass = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { codeI, newPassword } = req.body;
    const user = await AdminModel.forgetPasswordWithCode(codeI);
    let pass = String(newPassword);
    const salt = await bcrypt.genSalt();
    pass = await bcrypt.hash(pass, salt);
    try {
        if (codeI == user.code) {

            try {
                await AdminModel.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            password: pass,
                        }
                    }, { new: true, upsert: true, setDefaultsOnInsert: true },
                    (err, docs) => {
                        if (!err) return res.status(200).json({ success: true });
                        else return res.status(200).json({ error: err })
                    }
                );
            } catch (err) {
                res.status(200).send({ err });
            }
        } else {
            res.status(200).json({ messge: 'Code de validation incorrect' });
        }
    } catch (error) {
        res.status(200).json({ erreur: 'Code de validation incorrect' });
    }
}


// deconnexion
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}


// Operations



// les infos de tous les utilisateurs sauf le password
module.exports.allUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

// info d'un utilisateur
module.exports.userInfo = async (req, res) => {
    (!ObjectID.isValid(req.params.id)) ? res.status(400).send('ID unknow : ' + req.params.id)
        : UserModel.findById(req.params.id, (err, docs) => {
            if (!err) res.send(docs)
            else console.log('ID unknow :' + err);
        }).select('-password');
}

// suppression d'un utilisateur
module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    try {
        await UserModel.remove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Suppresion réussie" });
    } catch (error) {
        res.status(200).json({ message: error });
    }
}

// discussion de l'utilisateur avec un autre utilisateur
module.exports.writeMsg = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    try {
        await UserModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    discussion: {
                        emetteur: req.body.emetteur,
                        recepteur: req.params.id,
                        message: req.body.message,
                    },
                }
            },
            { new: true },
            (err, docs) => {
                if (err) return res.status(200).send(err);
            }
        );
        await UserModel.findByIdAndUpdate(
            req.body.emetteur,
            {
                $addToSet: {
                    discussion: {
                        emetteur: req.body.emetteur,
                        recepteur: req.params.id,
                        message: req.body.message,
                    },
                }
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.status(200).json({success:true});
                else return res.status(200).send(err);
            }
        )
    } catch (error) {
        return res.status(200).send(err);
    }
}