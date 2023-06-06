const express = require("express");
const router = express.Router();
const loginController = require("../controller/loginController");
// const {isAuth} = require("../controllers/users");

router.post("/login", loginController.login);
router.post("/create-account",  loginController.createUser);
router.post("/forget",  loginController.resetPassword);


module.exports = router;