const UserModel = require('../models/user.model'); // user model
const ObjectID = require('mongoose').Types.ObjectId; // pour les ids
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline)


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

// mise à jour de certains infos
module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    try {
        await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio,
                    phone: req.body.phone,
                    adresse: req.body.adresse
                }
            }, { new: true, upsert: true, setDefaultsOnInsert: true },
            (err, docs) => {
                if (!err) return res.status(200).json({ success: true })
                else return res.status(200).json({ error: err })
            }
        )
    } catch (error) {
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
        const errors = uploadErrors(error);
        return res.status(201).json({ errors });
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
            { $set: { pictures: "./uploads/profil/" + fileName } },
            { new: true, upsert: true, setDefaultsOnInsert: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(201).send({ message: err });
            }
        )
    } catch (error) {
        return res.status(201).json({ message : error })
        console.log(error);
    }

}