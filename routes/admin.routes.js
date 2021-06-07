const router = require('express').Router(); // systeme de routage complet
const authController = require('../controllers/auth.controller'); // Controller auth
const adminController = require('../controllers/admin.controller'); // user controller

// authentification
router.post('/register', adminController.signUp);
router.post('/login', adminController.signIn);
router.get('/logout', adminController.logout);
router.put('/forget',adminController.sendEmailAndUpdateCode);
router.put('/updatePass',adminController.codeVerifyAndUpdatePass);

// others
router.get('/',adminController.allUsers);
router.get('/:id',adminController.userInfo);
router.delete('/delete/:id',adminController.deleteUser);

module.exports = router;