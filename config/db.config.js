// Mongodb object
const mongoose = require('mongoose');

// Connexion
mongoose
    .connect("mongodb://localhost:27017/hustler",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Erreur : ", err));