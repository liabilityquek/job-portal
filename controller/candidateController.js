const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAllJobPost = async (req, res) => {
  try {
    const findJob = await prisma.JobPost.findMany({
      where: {
        title: {
          contains: req.query.title,
          mode: 'insensitive'
        }
      },
    });
    res.status(201).json(findJob);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job post");
  }
};

const createJobAns = async (req, res) => {
  try {
    const { answer, questionId, jobPostId, userId } = req.body
    const newJobAns = await prisma.JobAnswer.create({
      data: {
        answer,
        questionId,
        jobPostId,
        userId
      },
    });
    res.status(201).json(newJobAns);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error submitting job answer");
  }
};

const createApplication = async (req, res) => {
  try {
    const { userId, jobPostId } = req.body;

    const newApplication = await prisma.Application.create({
        data: {
            userId,
            jobPostId,
            user: {
              connect: {
                id: req.body.userId,
              },
            },
            jobPost: {
              connect: {
                id: req.body.jobPostId,
              },
            },
          },
        });
    res.status(201).json(newApplication);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error submitting job answer");
  }
};

const getJobQns = async (req, res) => {
  try {
    const jobQns = await prisma.JobQuestion.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!jobQns) {
      return res.status(404).send("Job question not found");
    } else {
      res.status(201).json(jobQns);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job question");
  }
};

const getJobPost = async (req, res) => {
  const { id, postedBy } = req.params;
  try {
    const findJob = await prisma.JobPost.findUnique({
      where: {
        postedBy: Number(postedBy),
        id: Number(id),
      },
    });
    if (!findJob) {
      return res.status(404).send(`Error showing job id: ${id}`);
    } else {
      res.status(200).json(findJob);
    }
  } catch (e) {
    console.log("error", e);
    res.status(500).send(`Error showing job id: ${id}`);
  }
};

module.exports = {
  getAllJobPost,
  createJobAns,
  createApplication,
  getJobQns
};
