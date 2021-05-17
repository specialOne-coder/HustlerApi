const router = require('express').Router(); // systeme de routage complet
const PostModel = require('../models/post.model'); // post model
const postController = require('../controllers/post.controller'); // post controller
const multer = require('multer');  // librairie multer pour les uploads de fichiers
const upload = multer();


// route menant aux opérations sur les posts
router.get('/',postController.readPost);
router.post('/create',upload.single('file'),postController.createPost);
router.put('/update/:id',postController.updatePost);
router.delete('/delete/:id',postController.deletePost);


module.exports = router;