const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Yup = require("yup");

const createEmployer = async (req, res) => {
  const { name, description, imageUrl, userId } = req.body;
  try {

    const schema = Yup.object().shape({
      name: Yup.string().required("This field is required"),
      description: Yup.string().required("This field is required"),
      userId: Yup.number().required("This field is required")
    });

    await schema.validate(req.body);

    const existingEmployer = await prisma.Employer.findFirst({
      where: {
        name:name
      },
    });

    if (existingEmployer) {
      return res.status(400).send("Employer already exists");
    }
    
    const user = await prisma.User.findUnique({
      where:{
        id: userId,
      },
    });

    if(!user.roles.includes("Employer")){
      return res.status(400).send("You don't have the necessary permissions to create an employer profile");
    }

    const newEmployer = await prisma.Employer.create({
      data: {
        name,
        description,
        imageUrl,
        userId
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
  const { title, description, location, salary, skills } = req.body;
  try {
    const existingJobPost = await prisma.JobPost.findUnique({
      where: {
        title,
      },
    });

    if (existingJobPost) {
      return res.status(400).send("Job Title already exists");
    }

    const newJobPost = await prisma.JobPost.create({
      data: {
        title,
        description,
        location,
        salary,
        employer: {
          connect: {
            id: req.body.employerId,
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
    console.log("error: ", e);
    res.status(500).send("Error creating job post");
  }
};

const deleteJobPost = async (req, res) => {
  const { id } = req.params;

  const currentUserId = req.userId;

  if (!currentUserId) {
    return res
      .status(401)
      .send("Unauthorized: You must be logged in to perform this action.");
  }

  const jobPost = await prisma.JobPost.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!jobPost) {
    return res.status(404).send("Job post not found");
  }

  if (jobPost.employerId !== currentUserId) {
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
  const { id } = req.params;
  const { title, description, location, salary, isActive, skills } = req.body;
  const currentUserId = req.userId;

  if (!currentUserId) {
    return res
      .status(401)
      .send("Unauthorized: You must be logged in to perform this action.");
  }

  const jobPost = await prisma.JobPost.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!jobPost) {
    return res.status(404).send("Job post not found");
  }

  if (jobPost.employerId !== currentUserId) {
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
  const { employerId } = req.params;
  const currentUserId = req.userId;
  if (!currentUserId) {
    return res.send(401).json({
      error: "Unauthorized: You must be logged in to perform this action.",
    });
  }
  try {
    const findAllJob = await prisma.JobPost.findMany({
      where: {
        employerId: Number(employerId),
      },
    });
    if (!findAllJob) {
      return res.status(404).send("Error showing all jobs found");
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

const getAllJobAns = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.userId;
  if (!currentUserId) {
    return res
      .send(401)
      .json({
        error: "Unauthorized: You must be logged in to perform this action.",
      });
  }
  try {
    const jobAns = await prisma.JobAnswer.findMany({
      where: {
        id: Number(id),
      },
    });
    if (!jobAns) {
      return res.status(404).send("Job answer not found");
    }
    if (jobAns.length === 0) {
      return res.status(200).send("No answer/s found");
    } else {
      res.status(201).json(jobAns);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job answer");
  }
};

//get a single job answer based on a single userId
const getJobAns = async (req, res) => {
  const currentUserId = req.userId;
  const { id, profileId } = req.params;
  if (!currentUserId) {
    return res
      .send(401)
      .json({
        error: "Unauthorized: You must be logged in to perform this action.",
      });
  }
  try {
    const jobAns = await prisma.JobAnswer.findUnique({
      where: {
        id: Number(id),
        profileId: Number(profileId),
      },
    });
    if (!jobAns) {
      return res.status(404).send("Job answer not found");
    }
    if (jobAns.length === 0) {
      return res.status(201).send("No answer/s found");
    } else {
      res.status(201).json(jobAns);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job answer");
  }
};

const createJobQns = async (req, res) => {
  const { title, jobPostId, description } = req.body;
  try {
    const existingJobQns = await prisma.JobQuestion.findFirst({
      where: {
        title,
        jobPostId
      },
    });

    if (existingJobQns) {
      return res.status(400).send("Job Qns already exists");
    }
    const newJobQns = await prisma.JobQuestion.create({
      data: {
        title,
        description,
        jobPosts: {
          connect: {
            id: req.body.jobPostId,
          },
        },
      },
    });
    res.status(201).json(newJobQns);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error creating job post");
  }
};

const deleteJobQns = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.userId;

  if (!currentUserId) {
    return res
      .status(401)
      .send("Unauthorized: You must be logged in to perform this action.");
  }

  const jobQns = await prisma.JobQuestion.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!jobQns) {
    return res.status(404).send(`Job ${id} not found`);
  }

  if (jobQns.employerId !== currentUserId) {
    return res.status(403).send("You are not allowed to delete this job qns");
  }

  try {
    const deleteQns = await prisma.JobQuestion.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json(deleteQns);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error deleting job post");
  }
};

const amendJobQuestion = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const currentUserId = req.userId;

  if (!currentUserId) {
    return res
      .status(401)
      .send("Unauthorized: You must be logged in to perform this action.");
  }

  const jobQns = await prisma.JobPost.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!jobQns) {
    return res.status(404).send(`Job ${id} not found`);
  }

  if (jobQns.employerId !== currentUserId) {
    return res.status(403).send("You are not allowed to amend this job qns");
  }
  try {
    const amendJobQns = await prisma.JobQuestion.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
      },
    });
    res.status(200).json(amendJobQns);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error updating job qns");
  }
};

const getJobPostApplication = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.userId;
  const skill = req.query.skill;

  if (!currentUserId) {
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

    if (jobPost.employerId !== currentUserId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to access this job post" });
    }

    const applicationsWithDesiredSkill = [];
    for (let i = 0; i < jobPost.applications.length; i++) {
      const application = jobPost.application[i];
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
  getAllJobAns,
  getJobAns,
  createJobQns,
  deleteJobQns,
  amendJobQuestion,
  getJobPostApplication,
};
