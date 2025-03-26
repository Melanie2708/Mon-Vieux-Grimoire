const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const processImage = require("../middleware/process-image");

const bookController = require("../controllers/books.controller");

router.get("/", bookController.getAllBook);
router.post("/", auth, multer, processImage, bookController.createBook);
router.get("/bestrating", bookController.getBestBooks);
router.get("/:id", bookController.getOneBook);
router.put("/:id", auth, multer, processImage, bookController.modifyBook);
router.delete("/:id", auth, bookController.deleteBook);
router.post("/:id/rating", auth, bookController.rateBook);
module.exports = router;
