const router = require('express').Router(); // systeme de routage complet
const authController = require('../controllers/auth.controller'); // Controller auth
const userController = require('../controllers/user.controller'); // user controller

// authentification
router.post('/register', authController.signUp);
router.post('/login', authController.signIn);
router.get('/logout', authController.logout);
router.put('/forget',authController.sendEmailAndUpdateCode);
router.put('/updatePass',authController.codeVerifyAndUpdatePass);

// others
router.get('/',userController.allUsers);
router.get('/:id',userController.userInfo);
router.put('/update/:id',userController.updateUser);
router.delete('/delete/:id',userController.deleteUser);
router.patch('/write/:id',userController.writeMsg);


module.exports = router;