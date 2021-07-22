const UserModel = require('../models/user.model'); // import du modèle utilisateur
const { signUpErrors, signInErrors } = require('../utils/error.utils'); // gestion des erreurs
const jwt = require('jsonwebtoken'); // jwt
const maxAge = 3 * 24 * 60 * 1000; // cookie life
const bcrypt = require('bcrypt'); // cryptage du mot de passe modifié
const nodemailer = require('nodemailer'); // envoi de mail
const { mailConfirmation } = require('./html/mailConfirmation');
const { mailForget } = require('./html/mailForget');


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
        const codeVerif = Math.floor(100000 + Math.random() * 900000);
        if (user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'frdndattivi@gmail.com',
                    pass: 'ferdinand8918',
                }
            });
            var mailOptions = {
                from: 'frdndattivi@gmail.com',
                to: String(user.email),
                subject: 'Mail de confirmation',
                text: String(codeVerif),
                html: mailConfirmation(codeVerif)
            };
            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    //return res.status(200).json({ message: "le mail n'a pu etre envoyé" });
                    console.log("Erreur d'envoi du mail : " + err.message);
                    return res.status(500).json({ success: false, message: "le mail n'a pu etre envoye" })
                } else {
                    //console.log('Modif en cours');
                    await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                verifiedCode: codeVerif,
                            }
                        }, { new: true, upsert: true, setDefaultsOnInsert: true },
                        (err, docs) => {
                            if (!err) ;
                            else console.log(err);
                        }
                    );
                    res.status(200).json({ success: true, message: "Mail envoye" })
                }
            });
        }
    } catch (err) {
        const errors = signUpErrors(err);
        res.status(300).json(errors);
    }
}

// Renvoyer confirmation mail
module.exports.resend = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.searchWithEmail(email);
        const codeVerif = Math.floor(100000 + Math.random() * 900000);
        if (user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'frdndattivi@gmail.com',
                    pass: 'ferdinand8918',
                }
            });
            var mailOptions = {
                from: 'frdndattivi@gmail.com',
                to: String(user.email),
                subject: 'Mail de confirmation',
                html: mailConfirmation(codeVerif)
            };
            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "le mail n'a pu etre envoye" })
                } else {
                    await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                verifiedCode: codeVerif,
                            }
                        }, { new: true, upsert: true, setDefaultsOnInsert: true },
                        (err, docs) => {
                            if (!err) console.log(docs);
                            else console.log(err);
                        }
                    );
                    res.status(200).json({ success: true, message: "Mail envoye" })
                }
            });
        }
    } catch (error) {
        res.status(300).json({ success: false });
    }
}

// verified
module.exports.verified = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { verifiedCode } = req.body;
    try {
        const user = await UserModel.verifiedCode(verifiedCode);
        if (verifiedCode == user.verifiedCode) {
            try {
                await UserModel.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            verified: 'oui',
                        }
                    }, { new: true, upsert: true, setDefaultsOnInsert: true },
                    (err, docs) => {
                        if (!err) return res.status(200).json({ success: true, message: 'Modification reussie' });
                        else console.log(err);
                    }
                );
            } catch (err) {
                res.status(500).send({ err });
            }
        } else {
            log
            res.status(400).json({ success: false, messge: 'Erreur 400 Code de validation incorrect' });
        }
    } catch (error) {
        res.status(300).json({ success: false, message: error });
    }

}
// connexion
module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ success: true, userId: user._id, token: token });
    } catch (err) {
        const errors = signInErrors(err);
        res.status(300).send({ errors });
    }
}



// mot de passe oublié
module.exports.sendEmailAndUpdateCode = async (req, res) => { // met a jour le mot code apres envoi du mail

    const { email } = req.body;
    try {
        const user = await UserModel.searchWithEmail(email);
        const codeVerif = Math.floor(100000 + Math.random() * 900000);
        if (user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'frdndattivi@gmail.com',
                    pass: 'ferdinand8918',
                }
            });
            var mailOptions = {
                from: 'frdndattivi@gmail.com',
                to: String(user.email),
                subject: 'Forget password',
                text: String(codeVerif),
                html: mailForget(user.pseudo, codeVerif)
            };
            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "le mail n'a pu etre envoye" })
                } else {
                    await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                forgetCode: codeVerif,
                            }
                        }, { new: true, upsert: true, setDefaultsOnInsert: true },
                        (err, docs) => {
                            if (!err);
                            else console.log(err);
                        }
                    );
                    res.status(200).json({ success: true, message: "Mail envoye" });
                }
            });
        }
    } catch (error) {
        res.status(300).json({ success: false, messsage: 'Email incorrect : ' + error });
    }
}

module.exports.codeVerifyAndUpdatePass = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { forgetCode, newPassword } = req.body;
    try {
        const user = await UserModel.forgetCode(forgetCode);
        let pass = String(newPassword);
        const salt = await bcrypt.genSalt();
        pass = await bcrypt.hash(pass, salt);
        if (forgetCode == user.forgetCode) {
            try {
                await UserModel.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            password: pass,
                        }
                    }, { new: true, upsert: true, setDefaultsOnInsert: true },
                    (err, docs) => {
                        if (!err) return res.status(200).json({ success: true, message: 'Modification reussie' });
                        else return res.status(500).json({ success: false, message: "Erreur de modifiacation , réessayer" })
                    }
                );
            } catch (err) {
                res.status(500).send({ err });
            }
        } else {
            res.status(400).json({ success: false, messge: 'Erreur 400 Code de validation incorrect' });
        }
    } catch (error) {
        res.status(300).json({ success: false, messge: error });
    }

}

// Renvoyer confirmation mail
module.exports.resendForgetCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.searchWithEmail(email);
        const codeVerif = Math.floor(100000 + Math.random() * 900000);
        if (user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'frdndattivi@gmail.com',
                    pass: 'ferdinand8918',
                }
            });
            var mailOptions = {
                from: 'frdndattivi@gmail.com',
                to: String(user.email),
                subject: 'Mail de reinitialisation de password',
                html: mailForget(user.pseudo, codeVerif)
            };
            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "le mail n'a pu etre envoye" })
                } else {
                    await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                forgetCode: codeVerif,
                            }
                        }, { new: true, upsert: true, setDefaultsOnInsert: true },
                        (err, docs) => {
                            if (!err);
                            else console.log(err);
                        }
                    );
                    res.status(200).json({ success: true, message: "Mail envoye" })
                }
            });
        }
    } catch (error) {
        res.status(300).json({ success: false });
    }
}
// deconnexion
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}