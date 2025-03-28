const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;
require("dotenv").config();
const dbConnection = process.env.DB_PARAMETER;

const bookRoutes = require("./routes/books.route");
const userRoutes = require("./routes/users.route");

const app = express();

// Création du dossier images si celui ci n'existe pas
fs.mkdir(path.join(__dirname, "images"), { recursive: true })
  .then(() => console.log("Dossier images crée"))
  .catch((error) => console.log(`Dossier images non crée. Erreur : ${error}`));

mongoose
  .connect(dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
