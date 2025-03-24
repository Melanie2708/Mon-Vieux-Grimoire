const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const bookController = require("../controllers/books.controller");

router.get("/", bookController.getAllBook);
router.post("/", auth, bookController.createBook);
router.get("/:id", bookController.getOneBook);
router.put("/:id", auth, bookController.modifyBook);
router.delete("/:id", auth, bookController.deleteBook);

module.exports = router;
