const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  //Récupération du livre dans le corps de la requête
  const bookObject = JSON.parse(req.body.book);

  //Suppression de l'id (qui sera généré par la base de données lors de l'insertion)
  // et du userId, qui est récupéré dans les données d'authentification
  delete bookObject._id;
  delete bookObject._userId;

  // Création d'un nouveau livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  // Sauvegarde du livre en base de données
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBook = (req, res, next) => {
  // Récupération de tous les livres
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  // Récupération d'un livre
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  // Récupération du livre dans la requête
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  // Suppression de l'userId
  delete bookObject._userId;

  // Récupération du livre dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Si livre trouvé, vérification du userId
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Modification du livre dans la base de données
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  // Récupération du livre dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Si livre trouvé, vérification du userId
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Récupération du nom de l'image dans le dossier
        const filename = book.imageUrl.split("/images/")[1];

        //Suppression de l'image dans le dossier
        fs.unlink(`images/${filename}`, () => {
          // Suppression du livre dans la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.rateBook = (req, res, next) => {
  // Récupération du livre dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification si l'utilisateur a déjà noté le livre
      if (book.ratings.find((rate) => rate.userId === req.auth.userId)) {
        res.status(400).json({ message: "L'utilisateur a déjà noté le livre !" });
      } else {
        // Ajout de la note
        book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

        // On calcule la moyenne
        const moyenne = book.ratings.reduce((acc, rate) => acc + rate.grade, 0);
        book.averageRating = moyenne / book.ratings.length;
        // Sauvegarde de la note
        book
          .save()
          .then(() => res.status(200).json(book))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
