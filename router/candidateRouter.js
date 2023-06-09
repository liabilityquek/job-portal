const express = require("express");
const router = express.Router();
const jobPostController = require("../controller/candidateController");
// const {isAuth} = require("../controllers/users");

router.get("/job-posts-query", jobPostController.getAllJobPostWithQuery);
router.get("/job-posts", jobPostController.getAllJobPost);
router.post("/create-application/:profileId/:jobPostId/:employerId", jobPostController.createApplication);
router.post("/create-profile/:userId", jobPostController.createProfile);
module.exports = router;