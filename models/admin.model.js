const mongoose = require('mongoose'); // MongoDB Object 
const { isEmail } = require('validator'); // Email validator library
const bcrypt = require('bcrypt'); // Password crypt

// Schema du document user 
const adminSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 25,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            validate: [isEmail],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            max: 1024,
            minLength: 6
        },
        code: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

// Avant les saves crypter le mot de passe
adminSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})


// Connexion d'un utilisateur par email et password
adminSchema.statics.login = async function (email, password) {
    const admin = await this.findOne({ email }); //recherche de l'utilisateur par email
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password); // s'il existe,decrypter et comparer les passwords
        if (auth) {
            return admin;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect email');
}

// mot de passe oublié , recherche par email pour lui envoyer un code
adminSchema.statics.forgetPasswordWithEmail = async function (email) {
    const admin = await this.findOne({ email });
    if (admin) {
        return admin;
    }
    throw Error('Cet email n\'existe pas');
}

// mot de passe oublié , recherche par code pour lui donner la main de modifier le mot de passe
adminSchema.statics.forgetPasswordWithCode = async function (code) {
    const admin = await this.findOne({ code });
    if (admin) {
        return admin;
    }
    console.log('Code de validation incorrect');
}

const AdminModel = mongoose.model('admin', adminSchema); // creation du modèle dans la bdd

module.exports = AdminModel;