const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Yup = require("yup");

const getAllJobPostWithQuery = async (req, res) => {
  //done
  const title = req.query.title;
  try {
    const findJob = await prisma.JobPost.findMany({
      where: {
        title: {
          contains: title,
          mode: "insensitive",
        },
      },
    });
    res.status(200).json(findJob);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job post");
    res.status(404).send(e);
  }
};

const getAllJobPost = async (req, res) => {
  //done
  try {
    const findJob = await prisma.JobPost.findMany({});
    res.status(200).json(findJob);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error getting job post");
    res.status(404).send(e);
  }
};

const createApplication = async (req, res) => {
  //done
  const { profileId, jobPostId, employerId } = req.params;
  const findProfile = await prisma.Profile.findUnique({
    where: {
      id: Number(profileId),
    },
  });

  if (!findProfile) {
    return res.status(404).send("User not found");
  }

  try {
    const newApplication = await prisma.Application.create({
      data: {
        profileId: Number(profileId),
        jobPostId: Number(jobPostId),
        employerId: Number(employerId),
      },
    });

    res.status(201).json(newApplication);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error submitting job application");
  }
};

const createProfile = async (req, res) => {
  //done
  const {
    salary,
    qualification,
    experience,
    skills,
    resumeUrl,
    coverLetterUrl,
  } = req.body;
  const { userId } = req.params;
  try {
    const existingProfile = await prisma.Profile.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (existingProfile) {
      return res.status(400).send("Profile already exists");
    }

    const findProfile = await prisma.User.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!findProfile || !findProfile.roles.includes("Candidate")) {
      return res
        .status(400)
        .send(
          "You don't have the necessary permissions to create an candidate profile"
        );
    }

    const newProfile = await prisma.Profile.create({
      data: {
        userId: findProfile.id,
        salary: salary,
        resumeUrl: resumeUrl,
        coverLetterUrl: coverLetterUrl,
        skills: {
          connectOrCreate: skills.map((skill) => ({
            where: { name: skill },
            create: { name: skill },
          })),
        },
        qualification: {
          create: [
            {
              school: qualification.school,
              studyField: qualification.studyField,
              yearObtain: qualification.yearObtain,
              qualiType: qualification.qualiType,
              qualiName: qualification.qualiName,
            },
          ],
        },
        experience: {
          create: [
            {
              companyName: experience.companyName,
              jobTitle: experience.jobTitle,
              industry: experience.industry,
              employment: experience.employment,
              workFrom: experience.workFrom,
              workTo: experience.workTo,
            },
          ],
        },
      },
    });

    res.status(201).json(newProfile);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error creating employer profile");
  }
};

const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { salary, skills, resumeUrl, coverLetterUrl, isOpentoWork } = req.body;

  const existingProfile = await prisma.Profile.findUnique({
    where: { userId: Number(userId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }
  
  const skillsArray = Array.isArray(skills) ? skills : [];

  try {
    const updatedProfile = await prisma.Profile.update({
      where: {
        userId: Number(userId),
      },
      data: {
        salary,
        resumeUrl,
        coverLetterUrl,
        isOpentoWork,
        skills: {
          connectOrCreate: skillsArray.map((skill) => ({
            where: { name: skill },
            create: { name: skill },
          })),
        },
      },
    });

    res.status(200).json(updatedProfile);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error updating profile");
  }
};

const getSingleJobPost = async (req, res) => {
  const { id } = req.params;
  try {
    const findJob = await prisma.JobPost.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        employer: true,
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
  getAllJobPostWithQuery,
  createApplication,
  getSingleJobPost,
  createProfile,
  getAllJobPost,
  updateProfile,
};
