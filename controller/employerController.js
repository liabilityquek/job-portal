const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Yup = require("yup");

const createEmployer = async (req, res) => {
  //done
  const { name, description, imageUrl, userId, location } = req.body;
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required("This field is required"),
      description: Yup.string().required("This field is required"),
      userId: Yup.number().required("This field is required"),
      location: Yup.string().required("This field is required"),
    });

    await schema.validate(req.body);

    const existingEmployer = await prisma.Employer.findFirst({
      where: {
        name: name,
      },
    });

    if (existingEmployer) {
      return res.status(400).send("Employer already exists");
    }

    const user = await prisma.User.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user.roles.includes("Employer")) {
      return res
        .status(400)
        .send(
          "You don't have the necessary permissions to create an employer profile"
        );
    }

    const newEmployer = await prisma.Employer.create({
      data: {
        name,
        description,
        imageUrl,
        userId,
        location,
      },
    });

    res.status(201).json(newEmployer);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error creating employer profile");
  }
};

const createJobPost = async (req, res) => {
  //done
  const {
    title,
    description,
    salary,
    skills,
    jobLevel,
    jobFunction,
    employment,
    requirements,
    userId,
  } = req.body;

  try {
    const schema = Yup.object().shape({
      title: Yup.string().required("This field is required"),
      description: Yup.string().required("This field is required"),
      salary: Yup.string().required("This field is required"),
      requirements: Yup.string().required("This field is required"),
    });

    await schema.validate(req.body);

    const employer = await prisma.Employer.findUnique({
      where: {
        userId: userId,
      },
    });
    const existingJobPost = await prisma.JobPost.findFirst({
      where: {
        title: title,
        employer: {
          userId: userId,
        },
      },
    });

    if (!employer) {
      return res.status(404).send("Employer not found");
    }

    if (existingJobPost) {
      return res.status(400).send("Job Title already exists");
    }

    const newJobPost = await prisma.JobPost.create({
      data: {
        title,
        description,
        location: employer.location,
        salary,
        jobLevel,
        jobFunction,
        employment,
        requirements,
        employer: {
          connect: {
            id: employer.id,
          },
        },
        skills: {
          connectOrCreate: skills.map((skill) => ({
            where: { name: skill },
            create: { name: skill },
          })),
        },
      },
    });
    res.status(201).json(newJobPost);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error creating job post");
  }
};

const deleteJobPost = async (req, res) => {
  //done
  const { employerId, id } = req.params;

  const jobPost = await prisma.JobPost.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!jobPost) {
    return res.status(404).send("Job post not found");
  }

  if (jobPost.employerId !== Number(employerId)) {
    return res.status(403).send("You are not allowed to delete this job post");
  }

  try {
    const deleteJob = await prisma.JobPost.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json(deleteJob);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error deleting job post");
  }
};

const amendJobPost = async (req, res) => {
  //done
  const { employerId, id } = req.params;
  const {
    title,
    description,
    location,
    salary,
    isActive,
    skills,
    jobLevel,
    jobFunction,
    employment,
    requirements,
  } = req.body;

  if (!employerId) {
    return res
      .status(401)
      .send("Unauthorized: You must be logged in to perform this action.");
  }

  const jobPost = await prisma.JobPost.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      skills: true,
    },
  });

  if (!jobPost) {
    return res.status(404).send("Job post not found");
  }

  if (jobPost.employerId !== Number(employerId)) {
    return res.status(403).send("You are not allowed to amend this job post");
  }
  try {
    const amendJob = await prisma.JobPost.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        location,
        salary,
        isActive,
        jobLevel,
        jobFunction,
        employment,
        requirements,
        skills: {
          connectOrCreate: skills.map((skill) => ({
            where: { name: skill },
            create: { name: skill },
          })),
        },
      },
    });
    res.status(200).json(amendJob);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error updating job post");
  }
};

const getAllJobPost = async (req, res) => {
  //done
  const { employerId } = req.params;
  try {
    if (!employerId) {
      return res
        .status(401)
        .send("Unauthorized: You must be logged in to perform this action.");
    }
    const findAllJob = await prisma.JobPost.findMany({
      where: {
        employerId: Number(employerId),
      },
      include: {
        skills: true,
      },
    });
    if (!findAllJob && !findAllJob.employerId !== Number(employerId)) {
      return res.status(404).send("You do not have the permission to view this Job Posts");
    }
    if (findAllJob.length === 0) {
      return res.status(200).send("No job/s found");
    } else {
      res.status(201).json(findAllJob);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error showing all jobs found");
  }
};

const getSingleJobPost = async (req, res) => {
  //done
  const { employerId, id } = req.params;
  try {
    if (!employerId) {
      return res
        .status(401)
        .send("Unauthorized: You must be logged in to perform this action.");
    }
    const findSingleJob = await prisma.JobPost.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        skills: true,
        applications: true,
      },
    });
    if (findSingleJob.employerId !== Number(employerId) && !findSingleJob) {
      return res.status(404).send("You do not have the permission to view this Job Post");
    }else {
      res.status(201).json(findSingleJob);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error showing all jobs found");
  }
};
const getJobPostApplicationWithSkills = async (req, res) => {
  const { employerId, id } = req.params;
  const skill = req.query.skill;

  if (!employerId) {
    return res.send(401).json({
      error: "Unauthorized: You must be logged in to perform this action.",
    });
  }

  try {
    const jobPost = await prisma.JobPost.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        applications: {
          include: {
            user: {
              include: {
                profile: {
                  include: {
                    skills: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!jobPost) {
      return res
        .status(404)
        .json({ error: `Job post with id ${id} not found.` });
    }

    if (jobPost.employerId !== Number(employerId)) {
      return res
        .status(403)
        .json({ error: "You are not allowed to access this job post" });
    }

    const applicationsWithDesiredSkill = [];
    for (let i = 0; i < jobPost.applications.length; i++) {
      const application = jobPost.applications[i];
      for (let j = 0; j < application.user.profile.skills.length; j++) {
        const candidateSkill = application.user.profile.skills[j];
        if (candidateSkill.name === skill) {
          applicationsWithDesiredSkill.push(application);
          break;
        }
      }
    }

    res.status(200).json(applicationsWithDesiredSkill);
  } catch (e) {
    console.log("error", e);
    res
      .status(500)
      .json({ error: "An error occurred while fetching job applications." });
  }
};

module.exports = {
  createEmployer,
  amendJobPost,
  getAllJobPost,
  createJobPost,
  deleteJobPost,
  getJobPostApplicationWithSkills,
  getSingleJobPost
};
