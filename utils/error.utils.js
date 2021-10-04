
// Gestion des erreurs d'inscription
module.exports.signUpErrors = (err) => {
    let errors = { pseudo: '', email: '', password: '' };
    if (err.message.includes('pseudo')) errors.pseudo = "Pseudo incorrect , chosissez bien votre pseudo";

    if (err.message.includes("email")) errors.email = "Email incorrect";

    if (err.message.includes("password")) errors.password = "Le mot de passe doit avoir au moins 6 caractères";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
        errors.pseudo = "Ce pseudo existe déja ";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
        errors.email = "Ce email existe déja";

    return errors;
}

module.exports.uploadErrors = (err) => {
    let errors = { pseudo: '',email: '',  name: '',phone: '' };
    if (err.message.includes('pseudo')) errors.pseudo = "Pseudo incorrect , chosissez bien votre pseudo";

    if (err.message.includes("email")) errors.email = "Email incorrect";

    if (err.message.includes("name")) errors.name = "Nom incorrect";

    if (err.message.includes("phone")) errors.name = "Incorrect phone number";


    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
        errors.pseudo = "Ce nom d'utilisateur existe déja ";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
        errors.email = "Ce email existe déja";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("phone"))
        errors.email = "Ce email existe déja";

    return errors;
}

// Gestion des erreurs de connexion
module.exports.signInErrors = (err) => {
    let errors = { email: '', password: '' };

    if (err.message.includes("email")) errors.email = "Adresse email invalide";

    if (err.message.includes("password")) errors.password = "Mot de passe incorrect";

    return errors;

}

// Gestion des erreurs d'upload de fichier
module.exports.uploadErrorss = (err) => {
    let errors = { format: '', maxSize: "" };

    if (err.message.includes("invalid file")) errors.format = "Format incompatible";

    if (err.message.includes("max size")) errors.maxSize = "le fichier dépasse 500ko";

    return errors;
}
