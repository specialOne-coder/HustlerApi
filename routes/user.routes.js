const router = require('express').Router(); // systeme de routage complet
const authController = require('../controllers/auth.controller'); // Controller auth
const userController = require('../controllers/user.controller'); // user controller
const multer = require('multer');
const uplad = multer();


// authentification
router.post('/register', authController.signUp);
router.put('/verified', authController.verified);
router.put('/newEmailCode',userController.newEmailCode);
router.put('/updateEmail',userController.updateEmail);
router.post('/resend', authController.resend);
router.post('/login', authController.signIn);
router.get('/logout', authController.logout);
router.put('/forget', authController.sendEmailAndUpdateCode);
router.post('/resendForget', authController.resendForgetCode);
router.put('/updatePass', authController.codeVerifyAndUpdatePass);
router.put('/modifyPass', userController.modifyPass);

// others
router.get('/', userController.allUsers);
router.get('/:id', userController.userInfo);
router.put('/update/:id', userController.updateUser);
router.patch('/write/:id', userController.writeMsg);
router.post('/upload', uplad.single('file'), userController.uploadProfil)

module.exports = router;