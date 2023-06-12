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
router.delete("/delete-profile-experience/:profileId/:experienceId", candidateController.delExperience);
router.delete("/delete-profile-qualification/:profileId/:qualificationId", candidateController.delQualification);
router.put("/amend-profile-experience/:profileId/:experienceId", candidateController.amendExperience);
router.put("/amend-profile-qualification/:profileId/:qualificationId", candidateController.amendQualification);
router.post("/create-profile-qualification/:profileId", candidateController.createQualification);
router.post("/create-profile-experience/:profileId", candidateController.createExperience);
module.exports = router;