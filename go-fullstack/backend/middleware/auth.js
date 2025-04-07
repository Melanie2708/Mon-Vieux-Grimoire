const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupération du token dans le header Authorization
    const token = req.headers.authorization.split(" ")[1];

    // Décode le token avec la clé secrète utilisé pour l'encodage
    // Le token décodé contient le userId
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;

    // Ajout du userId dans la requête afin que le controller puisse vérifier une existance en base de données
    req.auth = {
      userId: userId,
    };

    // Envoi de la requête modifiée au controller ou prochain middleware
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
