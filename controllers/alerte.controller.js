const AlerteModel = require('../models/alerte.model');
const { uploadErrors } = require('../utils/error.utils');
const ObjectID = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);



// lecture des alertes
module.exports.readAlerte = (req, res) => {
    AlerteModel.find((err, docs) => {
        if (!err) return res.send(docs);
        else console.log('Erreur de recuperation ' + err);
    }).sort({ createdAt: -1 });
}

// alerte d'un client
module.exports.createAlerte = async (req, res) => {
    // fichier
    let fileName;
    if (req.file != null) {
        try {
            if (req.file.detectedMimeType !== "image/jpg" &&
                req.file.detectedMimeType !== "image/png" &&
                req.file.detectedMimeType !== "image/jpeg")
                throw Error('invalid file');
            if (req.file.size > 500000) throw Error("max size : 50mo");
        } catch (err) {
            const errors = uploadErrors(err);
            return res.status(201).json({ errors });
        }
        fileName = req.body.posterId + Date.now() + '.jpg';
        await pipeline(req.file.stream, fs.createWriteStream(`${__dirname}/../uploads/alertes/${fileName}`));
    }
    const newAlerte = new AlerteModel({
        alerteurId: req.body.alerteurId,
        titre: req.body.titre,
        message: req.body.message,
        service: req.body.service,
        dateTaf:req.body.dateTaf,
        position:req.body.position,
        prix:req.body.prix,
        picture: req.file != null ? "./uploads/posts/" + fileName : '',
    });
    try {
        const alerte = await newAlerte.save();
        return res.status(200).json({ succes: true })
    } catch (error) {
        return res.status(200).json({ error: error });
    }
}


// mise a jour de l'alerte
module.exports.updateAlerte = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    const updatedAlerte = { titre: req.body.titre,message: req.body.message, service: req.body.service, status: req.body.status }
    AlerteModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedAlerte },
        { new: true, upsert: true, setDefaultsOnInsert: false },
        (err, docs) => {
            if (!err) res.status(200).json({ succes: true })
            else res.status(200).json({ error: err })
        }
    )
}


// suppression d'une alerte
module.exports.deleteAlerte = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    AlerteModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) return res.status(200).json({ succes: true })
            else res.status(200).json({ error: err })
        }
    )
}

// Mise a jour de l'alerte apres offre
module.exports.doOffer = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    try {
        await AlerteModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    offres: {
                        id:req.body.id,
                        nom: req.body.name,
                    },
                }
            },
            { new: true },
            (err, docs) => {
                if (err) return res.status(200).send(err);
            }
        );
        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: {
                    activities: {
                        activity: req.params.id,
                        others:'hum',
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