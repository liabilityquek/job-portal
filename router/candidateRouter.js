const express = require("express");
const router = express.Router();
const candidateController = require("../controller/candidateController");
// const {isAuth} = require("../controllers/users");

router.get("/job-posts-query", candidateController.getAllJobPostWithQuery);
router.get("/job-posts", candidateController.getAllJobPost);
router.post("/create-application/:profileId/:jobPostId/:employerId", candidateController.createApplication);
router.post("/create-profile/:userId", candidateController.createProfile);
router.get("/job-posts/:id", candidateController.getSingleJobPost);
router.put("/update-profile/:userId", candidateController.updateProfile);
module.exports = router;