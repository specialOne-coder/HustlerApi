const PostModel = require('../models/post.model');
const { uploadErrors } = require('../utils/error.utils');
const ObjectID = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);



// lecture des posts
module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) return res.send(docs);
        else console.log('Erreur de recuperation ' + err);
    }).sort({ createdAt: -1 });
}

// post d'un agent
module.exports.createPost = async (req, res) => {
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
        await pipeline(req.file.stream, fs.createWriteStream(`${__dirname}/../uploads/posts/${fileName}`));
    }
    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        service: req.body.service,
        picture: req.file != null ? "./uploads/posts/" + fileName : '',
    });
    try {
        const post = await newPost.save();
        return res.status(200).json({ succes: true });
    } catch (error) {
        return res.status(200).json({ error: error });
    }
}


// mise a jour du post 
module.exports.updatePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    const updatedPost = { message: req.body.message, service: req.body.service }
    PostModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedPost },
        { new: true, upsert: true, setDefaultsOnInsert: false },
        (err, docs) => {
            if (!err) res.status(200).json({ succes: true })
            else console.log('Erreur de modification ' + err);
        }
    )
}

// suppression d'un post
module.exports.deletePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).send('ID unknow : ' + req.params.id);
    PostModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) return res.status(200).json({ succes: true })
            else res.status(200).json({ error: err });
        }
    )
}