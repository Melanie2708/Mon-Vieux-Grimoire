const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const processImage = async (req, res, next) => {
  // Si pas d'image dans la requête, on passe au middleware suivant
  if (!req.file) {
    return next();
  }

  try {
    // Modification du nom de l'image
    const inputPath = req.file.path;
    const outputFilename = `${path.parse(inputPath).name}.webp`;
    const outputPath = path.join("images", outputFilename);
    // Conversion de l'image
    await sharp(inputPath).resize({ width: 300, withoutEnlargement: true }).toFormat("webp").toFile(outputPath);

    fs.unlinkSync(inputPath); // Suppression de l'image originale

    req.file.filename = outputFilename;
    req.file.path = outputPath;

    next();
  } catch (error) {
    console.error("Erreur de traitement de l'image:", error);
    res.status(500).json({ error: "Erreur lors du traitement de l'image" });
  }
};

module.exports = processImage;
