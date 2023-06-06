const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const Yup = require("yup");

const createUser = async (req, res) => {
  const { email, password, name, roles } = req.body;
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required(),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          "Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        )
        .required(),
      name: Yup.string().required(),
      roles: Yup.string().required(),
    });

    await schema.validate(req.body);

    const existingUser = await prisma.User.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      return res.status(400).json("This account already exist");
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.User.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roles,
      },
    });

    res.status(201).json(newUser);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).json("Error creating a new user");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required(),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          "Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        )
        .required(),
    });

    await schema.validate(req.body);

    const findUser = await prisma.User.findUnique({
      where: {
        email,
      },
    });
    if (!findUser) {
      return res.status(400).json({ error: "Invalid User" });
    }
    const match = await bcrypt.compare(password, findUser.password);
    if (match) {
      const payload = { userId: findUser };
      const options = { expiresIn: "1h" };
      const token = jwt.sign(payload, JWT_SECRET, options);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(200).json({ token: token, user: findUser });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).json("Error creating a new user");
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required(),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          "Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character"
        )
        .required(),
    });

    await schema.validate(req.body);

    const findExistingUser = await prisma.User.findUnique({
      where: {
        email,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const checkMatch = await bcrypt.compare(
      password,
      findExistingUser.password
    );
    if (!checkMatch) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      findExistingUser.password = hash;
      await prisma.User.update({
        where: {
          email,
        },
        data: {
          password: hash,
        },
      });
      res.status(200).json({ message: "Password successfully changed" });
    } else {
      res.status(401).json({ message: "Error in changing password" });
    }
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).json("Error creating a new user");
  }
};

module.exports = {
  createUser,
  login,
  resetPassword,
};
