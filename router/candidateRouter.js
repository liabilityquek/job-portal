const express = require("express");
const router = express.Router();
const jobPostController = require("../controller/candidateController");
// const {isAuth} = require("../controllers/users");

router.get("/:title", jobPostController.getAllJobPost);
router.post("/", jobPostController.createJobAns);

module.exports = router;