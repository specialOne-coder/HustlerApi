const UserModel = require('../models/user.model'); // import du modèle utilisateur
const { signUpErrors, signInErrors } = require('../utils/error.utils'); // gestion des erreurs
const jwt = require('jsonwebtoken'); // jwt
const maxAge = 3 * 24 * 60 * 1000; // cookie life
const bcrypt = require('bcrypt'); // cryptage du mot de passe modifié
const nodemailer = require('nodemailer'); // envoi de mail


// jwt token creation function
const createToken = (id) => { // encodage avec l'id de l'utilisateur et la clé
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
}

// inscription
module.exports.signUp = async (req, res) => {
    const { pseudo, email, userType, password } = req.body; // inputs
    try {
        const user = await UserModel.create({ pseudo, email, userType, password }); // save user
        res.status(201).json({ user: user._id }); // renvoi de l'id de l'utilisateur inscrit
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
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = signInErrors(err);
        res.status(200).send({ errors });
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
    const user = await UserModel.forgetPasswordWithEmail(email);
    const codeSend = Math.floor(100000 + Math.random() * 900000);
    await sendEmail(String(email), String(codeSend));
    await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
            $set: {
                code: codeSend,
            }
        }, { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
            if (!err) return res.send(docs);
            else return res.status(200).json({ message: err })
        }
    );
}

module.exports.codeVerifyAndUpdatePass = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { codeI, newPassword } = req.body;
    const user = await UserModel.forgetPasswordWithCode(codeI);
    let pass = String(newPassword);
    const salt = await bcrypt.genSalt();
    pass = await bcrypt.hash(pass, salt);
    try {
        if (codeI == user.code) {

            try {
                await UserModel.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            password: pass,
                        }
                    }, { new: true, upsert: true, setDefaultsOnInsert: true },
                    (err, docs) => {
                        if (!err) return res.send(docs);
                        else return res.status(200).json({ message: err })
                    }
                );
            } catch (err) {
                res.status(200).send({ err });
            }
        } else {
            res.status(200).json({ messge: 'Code de validation incorrect' });
        }

    } catch (error) {
        res.status(200).json({ message: 'Erreur ' });
    }
}


// deconnexion
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}