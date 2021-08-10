const express = require('express'); // import du framework express
const bodyParser = require('body-parser'); // bodyparser pour les inputs
const cookieParser = require('cookie-parser'); // pour l'authentification jwt
const userRoutes = require('./routes/user.routes'); // routes des utilisateurs
const postRoutes = require('./routes/post.routes'); // routes des posts des agents
const adminRoutes = require('./routes/admin.routes'); // routes des posts des admins
const alerteRoutes = require('./routes/alerte.routes'); // routes des alertes des clients
const { checkUser, requireAuth } = require('./middleware/auth.middleware'); // middleware
require('dotenv').config({ path: './config/.env' }); // pour gérer les variables d'environnement
require('./config/db.config'); // import de la configuration du db 
const cors = require('cors'); // autorisation d'un programme tier
const app = express(); // main app


// cors 
const corsOptions = {
    origin:process.env.CLIENT_URL,
    credential:true,
    'allowedHeaders':['sessionId','content-Type'],
    'exposedHeaders':['sessionId'],
    'methods':'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue':false,
};
app.use(cors(corsOptions));

// inputs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// jwt
app.use(cookieParser());
//app.get('*', checkUser);
//app.get('/jwtid', requireAuth);

// routes 
app.use('/profilPic',express.static('uploads/profil'));
app.use('/alertePic',express.static('uploads/alertes'));
app.use('/postPic',express.static('uploads/posts'));
app.use('/hustler/user', userRoutes);
app.use('/hustler/post', postRoutes);
app.use('/hustler/alerte',alerteRoutes);
app.use('/hustler/admin',adminRoutes);

//autres fonctions a executer régulièrement


// serveur 
app.listen(process.env.PORT, () => {
    console.log(`Server start sur le port  ${process.env.PORT}`)
})