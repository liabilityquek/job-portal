const express = require("express");
const router = express.Router();
const employerController = require("../controller/employerController");
const { uploadImage } = require('../controller/upload')
// const {isAuth} = require("../controllers/users");

router.post("/create-profile", uploadImage, employerController.createEmployer);
router.post("/create-job",  employerController.createJobPost);
router.delete("/delete-job/:employerId/:id",  employerController.deleteJobPost);
router.put("/amend-job/:employerId/:id",  employerController.amendJobPost);
router.get("/show-jobs/:employerId",  employerController.getAllJobPost);
router.get("/show-jobs/:employerId/:id",  employerController.getSingleJobPost);
router.get("/show-jobs-application/:employerId/:id",  employerController.getJobPostApplicationWithSkills);


module.exports = router;