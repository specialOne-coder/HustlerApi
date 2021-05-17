const router = require('express').Router(); // systeme de routage complet
const alerteController = require('../controllers/alerte.controller'); // alerte controller
const multer = require('multer'); // librairie multer pour les uploads de fichiers
const upload = multer();

// alerte routes
router.get('/',alerteController.readAlerte);
router.post('/create',upload.single('file'),alerteController.createAlerte);
router.put('/update/:id',alerteController.updateAlerte);
router.delete('/delete/:id',alerteController.deleteAlerte);


module.exports = router;