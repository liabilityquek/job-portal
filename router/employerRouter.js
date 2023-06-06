const express = require("express");
const router = express.Router();
const employerController = require("../controller/employerController");
const { uploadImage } = require('../controller/upload')
// const {isAuth} = require("../controllers/users");

router.post("/create-profile", uploadImage, employerController.createEmployer);
router.post("/create-job",  employerController.createJobPost);
router.delete("/delete-job/:id",  employerController.deleteJobPost);
router.put("/amend-job/:id",  employerController.amendJobPost);
router.get("/show-jobs/:employerId",  employerController.getAllJobPost);
router.get("/show-jobs/:id",  employerController.getJobPostApplication);
router.get("/show-jobs-ans/:id",  employerController.getAllJobAns);
router.get("/show-jobs/:id/:userId",  employerController.getJobAns);
router.post("/create-job-qns",  employerController.createJobQns);
router.delete("/delete-job-qns/:id",  employerController.deleteJobQns);
router.put("/amend-job-qns/:id",  employerController.amendJobQuestion);

module.exports = router;