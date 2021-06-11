const mongoose = require('mongoose'); // MongoDB Object 
const { isEmail } = require('validator'); // Email validator library
const bcrypt = require('bcrypt'); // Password crypt

// Schema du document user 
const userSchema = new mongoose.Schema(
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
        pictures: {
            type: String,
            default: "./uploads/profil/avatar.png"
        },
        userType: {
            type: String,
            required: true,
        },
        discussion: {
            type: [
                {
                    emetteur: String,
                    recepteur: String,
                    message: String,
                    timestamps: Number
                }
            ],
            required: true,
        },
        activities: {
            type: [
                {
                    activity: String,
                    others: String,
                    timestamps: Number
                }
            ],
            required: true,
        },
        phone: {
            type: String,
        },
        code: {
            type: String,
        },
        bio: {
            type: String,
            max: 1024
        },
        adresse: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

// Avant les saves crypter le mot de passe
userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})


// Connexion d'un utilisateur par email et password
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email }); //recherche de l'utilisateur par email
    if (user) {
        const auth = await bcrypt.compare(password, user.password); // s'il existe,decrypter et comparer les passwords
        if (auth) {
            return user;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect email');
}

// mot de passe oublié , recherche par email pour lui envoyer un code
userSchema.statics.forgetPasswordWithEmail = async function (email) {
    const user = await this.findOne({ email });
    if (user) {
        return user;
    }
    throw Error('Cet email n\'existe pas');
}

// mot de passe oublié , recherche par code pour lui donner la main de modifier le mot de passe
userSchema.statics.forgetPasswordWithCode = async function (code) {
    const user = await this.findOne({ code });
    if (user) {
        return user;
    }
    console.log('Code de validation incorrect');
}



const UserModel = mongoose.model('user', userSchema); // creation du modèle dans la bdd

module.exports = UserModel;