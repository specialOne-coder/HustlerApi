const UserModel = require('../models/user.model'); // user model
const ObjectID = require('mongoose').Types.ObjectId; // pour les ids
const fs = require('fs');
const { promisify } = require('util');
const bcrypt = require('bcrypt'); // cryptage du mot de passe modifié
const nodemailer = require('nodemailer'); // envoi de mai
const pipeline = promisify(require('stream').pipeline)
const { uploadErrors,uploadErrorss } = require('../utils/error.utils');


// les infos de tous les utilisateurs sauf le password
module.exports.allUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

// info d'un utilisateur
module.exports.userInfo = async (req, res) => {
    (!ObjectID.isValid(req.params.id)) ? res.status(400).send('ID unknow : ' + req.params.id)
        : UserModel.findById(req.params.id, (err, docs) => {
            if (!err) res.status(200).json(docs)
            else console.log('ID unknow :' + err);
        }).select('-password');
}

// mise à jour de certains infos
module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    try {
        await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    pseudo: req.body.pseudo,
                    name: req.body.name,
                    bio: req.body.bio,
                    phone: req.body.phone,
                    adresse: req.body.adresse,
                    pictures: req.body.pictures,
                    genre: req.body.genre,
                    Dnaissance: req.body.Dnaissance,
                }
            }, { new: true, upsert: true, setDefaultsOnInsert: true },
            (err, docs) => {
                if (!err) return res.status(200).json({ success: true });
            }
        )
    } catch (err) {
        const errors = updateErrors(err);
        res.status(300).json(errors);
    }
}

// update Email Sending code
module.exports.newEmailCode = async (req, res) => { // met a jour le mot code apres envoi du mail

    const { email } = req.body;
    try {
        const user = await UserModel.searchWithEmail(email);
        const codeVerif = Math.floor(100000 + Math.random() * 900000);
        if (user) {
            res.status(400).send({ message: 'Cet email existe déja' })
        } else {
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
                subject: 'Mise à jour de votre email',
                text: String(codeVerif),
                html: mailConfirmation(user.pseudo, codeVerif)
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

// update Email 

module.exports.updateEmail = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { verifiedCode, newEmail } = req.body;
    try {
        const user = await UserModel.verifiedCode(verifiedCode);
        if (verifiedCode == user.verifiedCode) {
            try {
                await UserModel.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $set: {
                            verified: 'oui',
                            email: newEmail
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
            res.status(400).json({ success: false, messge: 'Erreur 400 Code de validation incorrect' });
        }
    } catch (error) {
        res.status(300).json({ success: false, message: error });
    }
}

// Mise a jour du password
module.exports.modifyPass = async (req, res) => { // verification du code et mise a jour du mot de passe
    const { email, oldPass, newPass } = req.body;
    try {
        const passwordVerify = await UserModel.verifyPass(email, oldPass);
        let pass = String(newPass);
        const salt = await bcrypt.genSalt();
        pass = await bcrypt.hash(pass, salt);
        if (passwordVerify) {
            try {
                await UserModel.findOneAndUpdate(
                    { _id: passwordVerify._id },
                    {
                        $set: {
                            password: pass,
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
            res.status(400).json({ success: false, messge: 'Erreur 400 Code de validation incorrect' });
        }
    } catch (error) {
        res.status(300).json({ success: false, message: error });
        console.log(error);
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
                if (!err) return res.status(200).json({ success: true });
                else return res.status(200).send(err);
            }
        )
    } catch (error) {
        return res.status(200).send(err);
    }
}

// upload profil 
module.exports.uploadProfil = async (req, res) => {
    try {
        if (req.file.detectedMimeType !== "image/jpg" &&
            req.file.detectedMimeType !== "image/png" &&
            req.file.detectedMimeType !== "image/jpeg")
            throw Error("invalid file");
        if (req.file.size > 500000) throw Error("max size : 50mo");
    } catch (error) {
        const errors = uploadErrorss(error);
        console.log(errors);
        return res.status(301).json({ errors });
    }

    const fileName = req.body.name + ".jpg";

    await pipeline(
        req.file.stream,
        fs.createWriteStream(
            `${__dirname}/../uploads/profil/${fileName}`
        )
    );

    try {
        await UserModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { pictures: fileName } },
            { new: true, upsert: true, setDefaultsOnInsert: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(201).send({ message: err });
            }
        )
    } catch (error) {
        return res.status(201).json({ message: error })
        console.log(error);
    }

}