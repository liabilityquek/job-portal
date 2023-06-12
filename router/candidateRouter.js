const express = require("express");
const router = express.Router();
const candidateController = require("../controller/candidateController");
// const { isAuth, requireRole } = require("../controller/loginController")
const { uploadResume, uploadCover } = require('../controller/upload')

// router.get("/job-posts-query", isAuth, requireRole(['Candidate']), candidateController.getAllJobPostWithQuery);

router.get("/job-posts-query", candidateController.getAllJobPostWithQuery);
router.get("/job-posts", candidateController.getAllJobPost);
router.post("/create-application/:profileId/:jobPostId/:employerId", candidateController.createApplication);
router.post("/create-profile/:userId", uploadResume, uploadCover, candidateController.createProfile);
router.get("/job-posts/:id", candidateController.getSingleJobPost);
router.put("/update-profile/:userId", uploadResume, uploadCover, candidateController.updateProfile);
router.delete("/delete-profile-experience/:profileId/:experienceId", candidateController.delExperience);
router.delete("/delete-profile-qualification/:profileId/:qualificationId", candidateController.delQualification);
router.put("/amend-profile-experience/:profileId/:experienceId", candidateController.amendExperience);
router.put("/amend-profile-qualification/:profileId/:qualificationId", candidateController.amendQualification);
router.post("/create-profile-qualification/:profileId", candidateController.createQualification);
router.post("/create-profile-experience/:profileId", candidateController.createExperience);
router.post("/new-saved-job/:profileId/:jobPostId", candidateController.createSavedJob);
router.delete("/delete-saved-job/:profileId/:jobPostId", candidateController.delSavedJob);
router.get("/job-posts-query/:profileId", candidateController.getAllJobPostWithQueryAndSavingQuery);
router.get("/past-search/:profileId", candidateController.getPastSearchFromProfile);
module.exports = router;