# HUSTLER-MOB REST API

Ceci est un web service d'un système permettant à une personne quelle que soit sa position de faire une demande de service de tout genre (Mécanique, Electricité, Plomberie, …) en cas de besoin. Les agents qui offrent ces services également pourront faire des offres de service. 

Un client en besoin lance l’alerte dans le système, et les services proches de lui pourront réagir sur sa demande, et les deux parties rentre en négociation jusqu’à trouver un point d’attente. Le demandeur sera donc servi après qu’un agent et lui soient mis d’accord.

## Available Scripts

Une fois le projet cloné , vous pouvez lancer:

### `npm install`

pour installer toutes les dépendances nécéssaires pour le bon fonctionnement du programme

##  Variable d'environnement 

Dans le dossier /config existe normalement un fichier `.env` qui répertorie les variables d'environnement.
Ce fichier n'est pas importé pour des raisons de sécurité.

Vous pouvez donc créer dans ce dossier un fichier `.env` et repertorier toutes les variables d'environnement,
tel que le port : **PORT** , l'url client : **CLIENT_URL** et un token secret : **TOKEN_SECRET**  etc ...
`EXEMPLE` : PORT=7845.\ CLIENT_URL=http://localhost:port.\ TOKEN_SECRET=ndhdjhfj

### `npm start`

Executez le service avec cette commande , assurez vous d'etre au bon emplacement en faisant **cd NomDuProjet** .\
Acceder a l'url [http://localhost:port](http://localhost:port) dans votre navigateur.

Vous pourrez ainsi avoir accès à toutes les erreurs dans votre console.

## Test

Vous pouvez tester ce web service avec le logiciel Postman , ou tout autre programme similaire.
C-A-D un programme permettant l'envoi des requetes de type : **POST , GET , UPDATE , DELETE , PATCH**.
**id** correspond a l'id du sujet en question.

### User

Acceder a l'url [http://localhost:port/hustler/user/register] avec une methode **POST** pour une inscription de l'utilisateur
avec pour attribut : **pseudo , email , userType , password**
Acceder a l'url [http://localhost:port/hustler/user/login] avec une methode **POST** pour une connexion de l'utilisateur.
avec pour attribut : **email , password**
Acceder a l'url [http://localhost:port/hustler/user/logout] avec une methode **GET** pour une déconnexion de l'utilisateur.
Acceder a l'url [http://localhost:port/hustler/user/] avec une methode **GET** pour avoir la liste de tous les utilisateurs.
Acceder a l'url [http://localhost:port/hustler/user/id] avec une methode **GET** pour avoir les informations concernant un utilisateur
Acceder a l'url [http://localhost:port/hustler/user/update/id] avec une methode **PUT** pour mettre à jour quelques informations.
avec pour attribut : **bio , phone , adresse**
Acceder a l'url [http://localhost:port/hustler/user/delete/id] avec une methode **DELETE** pour supprimer un utilisateur.
Acceder a l'url [http://localhost:port/hustler/user/forget] et [http://localhost:port/hustler/user/updatePass] avec une methode **PUT** pour mettre a jour un mot de passe.
Acceder a l'url [http://localhost:port/hustler/user/write/id] avec une methode **PATCH** pour ecrire un message a un utilisateur.

### Post

Acceder a l'url [http://localhost:port/hustler/post/] avec une methode **GET** pour avoir la liste de tous les posts .
Acceder a l'url [http://localhost:port/hustler/post/create] avec une methode **POST** pour une creer un post avec pour attribut
**posterId,message,service,file**
Acceder a l'url [http://localhost:port/hustler/post/update/id] avec une methode **PUT** mettre a jour le message et le type de service d'un post **message,service**
Acceder a l'url [http://localhost:port/hustler/post/delete/id] avec une methode **DELETE** pour supprimer un post.

### Alerte

Acceder a l'url [http://localhost:port/hustler/alerte/] avec une methode **GET** pour avoir la liste de tous les alertes .
Acceder a l'url [http://localhost:port/hustler/alerte/create] avec une methode **POST** pour une creer une alerte avec pour attribut
**alerteurId,message,service,file**
Acceder a l'url [http://localhost:port/hustler/alerte/update/id] avec une methode **PUT** mettre a jour le message ,le type de service et le status d'une alerte **message,service,status**
Acceder a l'url [http://localhost:port/hustler/alerte/delete/id] avec une methode **DELETE** pour supprimer une alerte.

