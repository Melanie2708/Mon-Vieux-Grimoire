const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  // Hachage du mot de passe
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Création d'un nouvel utilisateur
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Sauvegarde dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  // Récupération de l'utilisateur
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        // L'utilisateur n'est pas trouvé en base de données
        return res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
      }
      // Comparaison du mot de passe utilisé et celui en base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Paire login/mot de passe incorrecte" });
          }
          // Création du token si c'est le bon mot de passe
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
