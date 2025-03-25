const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputFilename = `${path.parse(inputPath).name}.webp`;
    const outputPath = path.join("images", outputFilename);

    await sharp(inputPath).toFormat("webp").toFile(outputPath);

    fs.unlinkSync(inputPath);

    req.file.filename = outputFilename;
    req.file.path = outputPath;

    next();
  } catch (error) {
    console.error("Erreur de traitement de l'image:", error);
    res.status(500).json({ error: "Erreur lors du traitement de l'image" });
  }
};

module.exports = processImage;
