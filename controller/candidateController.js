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

const getAllJobPostWithQueryAndSavingQuery = async (req, res) => {
  //done
  const title = req.query.title;
  const { profileId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  try {
    const findJob = await prisma.JobPost.findMany({
      where: {
        title: {
          contains: title,
          mode: "insensitive",
        },
      },
    });

    const findExistingPastQuery = await prisma.PastSearch.findFirst({
      where:{
        query: title
      }
    })

    if(existingProfile && !findExistingPastQuery){
      await prisma.PastSearch.create({
        data: {
          query: title,
          profileId: Number(profileId),
        },
      });
    }

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

const delQualification = async (req, res) => {
  const { profileId, qualificationId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const deletedQualification = await prisma.Qualification.delete({
      where: {
        id: Number(qualificationId),
      },
    });

    res.status(200).json(deletedQualification);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error deleting qualification");
  }
};

const delExperience = async (req, res) => {
  const { profileId, experienceId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const deletedExperience = await prisma.Experience.delete({
      where: {
        id: Number(experienceId),
      },
    });

    res.status(200).json(deletedExperience);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error deleting experience");
  }
};

const amendQualification = async (req, res) => {
  const { profileId, qualificationId } = req.params;
  const { school, studyField, yearObtain, qualiType, qualiName } = req.body;
  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const schema = Yup.object().shape({
      school: Yup.string(),
      studyField: Yup.string(),
      yearObtain: Yup.string(),
      qualiType: Yup.string(),
      qualiName: Yup.string(),
    });

    await schema.validate(req.body);
    const editQualification = await prisma.Qualification.update({
      where: {
        id: Number(qualificationId),
      },
      data: {
        school,
        studyField,
        yearObtain,
        qualiType,
        qualiName,
      },
    });

    res.status(200).json(editQualification);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error amending qualification");
  }
};

const amendExperience = async (req, res) => {
  const { profileId, experienceId } = req.params;
  const {
    companyName,
    jobTitle,
    industry,
    employment,
    workFrom,
    workTo,
    jobDesc,
  } = req.body;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const schema = Yup.object().shape({
      companyName: Yup.string(),
      jobTitle: Yup.string(),
      industry: Yup.string(),
      employment: Yup.string(),
      workFrom: Yup.string(),
      workTo: Yup.string(),
      jobDesc: Yup.string(),
    });

    await schema.validate(req.body);
    const editExperience = await prisma.Experience.update({
      where: {
        id: Number(experienceId),
      },
      data: {
        companyName,
        jobTitle,
        industry,
        employment,
        workFrom,
        workTo,
        jobDesc,
      },
    });

    res.status(200).json(editExperience);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error deleting experience");
  }
};

const createQualification = async (req, res) => {
  const { profileId } = req.params;
  const { school, studyField, yearObtain, qualiType, qualiName } = req.body;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const schema = Yup.object().shape({
      school: Yup.string().required("This field is required"),
      studyField: Yup.string().required("This field is required"),
      yearObtain: Yup.string().required("This field is required"),
      qualiType: Yup.string().required("This field is required"),
      qualiName: Yup.string().required("This field is required"),
    });

    await schema.validate(req.body);

    const newQualification = await prisma.Qualification.create({
      data: {
        school,
        studyField,
        yearObtain,
        qualiName,
        qualiType,
        profileId: Number(profileId),
      },
    });

    res.status(201).json(newQualification);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error creating new qualification");
  }
};

const createExperience = async (req, res) => {
  const { profileId } = req.params;
  const {
    companyName,
    jobTitle,
    industry,
    employment,
    workFrom,
    workTo,
    jobDesc,
  } = req.body;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  const findExistingExperience = await prisma.Experience.findFirst({
    where: {
      companyName: companyName,
      jobTitle: jobTitle,
    },
  });

  if (findExistingExperience) {
    return res
      .status(400)
      .send(`Duplicate record of experience: ${companyName}, ${jobTitle}`);
  }

  try {
    const schema = Yup.object().shape({
      companyName: Yup.string().required("This field is required"),
      jobTitle: Yup.string().required("This field is required"),
      industry: Yup.string().required("This field is required"),
      employment: Yup.string().required("This field is required"),
      workFrom: Yup.string().required("This field is required"),
      workTo: Yup.string().required("This field is required"),
      jobDesc: Yup.string(),
    });

    await schema.validate(req.body);

    const newExperience = await prisma.Experience.create({
      data: {
        companyName,
        jobTitle,
        industry,
        employment,
        workFrom,
        workTo,
        jobDesc,
        profileId: Number(profileId),
      },
    });

    res.status(201).json(newExperience);
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      // If the error is a Yup error, return a 400 status with the validation error message
      return res.status(400).json({ error: e.errors });
    }
    console.log("error: ", e);
    res.status(500).send("Error creating new experience");
  }
};

const createSavedJob = async (req, res) => {
  const { profileId, jobPostId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  const findExistingSavedJob = await prisma.SavedJob.findFirst({
    where: {
      jobPostId: Number(jobPostId),
      profileId: Number(profileId),
    },
    include: {
      jobPost: true,
    },
  });

  if (findExistingSavedJob) {
    // console.log(JSON.stringify(findExistingSavedJob, null, 2))
    return res
      .status(400)
      .send(`Job post : ${findExistingSavedJob.jobPost.title} has already been saved`);
  }

  try {
    const newSavedJob = await prisma.SavedJob.create({
      data: {
        jobPostId: Number(jobPostId),
        profileId: Number(profileId),
      },
      include: {
        jobPost: true,
      },
    });

    res.status(201).json(newSavedJob);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error creating new experience");
  }
};

const delSavedJob = async (req, res) => {
  const { profileId, jobPostId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  const findExistingSavedJob = await prisma.SavedJob.findFirst({
    where: {
      jobPostId: Number(jobPostId),
      profileId: Number(profileId),
    },
    include: {
      jobPost: true,
    },
  });

  if (!findExistingSavedJob) {
    return res
      .status(400)
      .send(`Job post Id : ${jobPostId} is not in your saved list`);
  }

  try {
    const deleteSavedJob = await prisma.SavedJob.delete({
      where: {
        id: findExistingSavedJob.id,
      },
      include: {
        jobPost: true,
      },
    });

    res.status(201).json(deleteSavedJob);
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send("Error deleting new experience");
  }
};

const getPastSearchFromProfile = async (req, res) => {
  const { profileId } = req.params;

  const existingProfile = await prisma.Profile.findUnique({
    where: { id: Number(profileId) },
  });

  if (!existingProfile) {
    return res.status(404).send("Profile not found");
  }

  try {
    const getPastSearch = await prisma.PastSearch.findMany({
      where: {
        profileId: Number(profileId)
      },
    });

    res.status(200).json(getPastSearch);
  } catch (e) {
    console.log("error", e);
    res.status(500).send("Error displaying past searches");
  }
};

module.exports = {
  getAllJobPostWithQuery,
  createApplication,
  getSingleJobPost,
  createProfile,
  getAllJobPost,
  updateProfile,
  delExperience,
  delQualification,
  amendQualification,
  amendExperience,
  createQualification,
  createExperience,
  createSavedJob,
  delSavedJob,
  getAllJobPostWithQueryAndSavingQuery,
  getPastSearchFromProfile
};
