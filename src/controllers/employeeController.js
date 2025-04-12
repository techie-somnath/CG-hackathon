import {
  generateSQL,
  processUserQuery,
} from "../utils/googleAI.js";
import dbUtils from "../utils/db.utils.js";

export const getEmployees = async (req, res) => {
  const data = {
    currentTeam: [
      {
        employeeId: "E101",
        name: "Alice Johnson",
        skills: ["Java", "Spring Boot", "Microservices"],
        yearsOfExperience: 5,
        designation: "Associate 2",
        certifications: [
          "AWS Certified Developer",
          "Oracle Java Certification",
        ],
        pastProjects: ["E-commerce platform", "Inventory Management System"],
        availability: "Available now",
        isRejected: false,
        Gender: "M",
      },
      {
        employeeId: "E102",
        name: "Michael Smith",
        skills: ["React.js", "Node.js", "MongoDB"],
        yearsOfExperience: 3,
        designation: "Consultant 1",
        certifications: ["Full Stack Developer Certification"],
        pastProjects: ["Social Media Application", "Real-time Chat App"],
        availability: "Available now",
        isRejected: false,
        Gender: "M",
      },
    ],
    specializedTeam: [
      {
        employeeId: "E201",
        name: "Sophia Williams",
        skills: ["Python", "Machine Learning", "Data Analysis"],
        yearsOfExperience: 7,
        designation: "Manager 1",
        certifications: [
          "Certified Data Scientist",
          "Google TensorFlow Developer",
        ],
        pastProjects: [
          "AI Fraud Detection System",
          "Predictive Analytics Tool",
        ],
        availability: "Available in 3 weeks",
        isRejected: false,
        Gender: "F",
      },
      {
        employeeId: "E202",
        name: "James Brown",
        skills: ["DevOps", "Kubernetes", "CI/CD Pipelines"],
        yearsOfExperience: 6,
        designation: "Manager 2",
        certifications: [
          "Docker Certified Associate",
          "AWS Certified DevOps Engineer",
        ],
        pastProjects: ["Cloud Deployment Automation", "Infrastructure as Code"],
        availability: "Available in 2 weeks",
        isRejected: false,
        Gender: "M",
      },
    ],
  };
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }
    console.log("Returning Data");
    const requiredResultJson = await processUserQuery(prompt);
    console.log(requiredResultJson, " this is result");
    const sqlQueries = await generateSQL(requiredResultJson);
    const finalData = await executeQueries(sqlQueries, dbUtils);
    //  console.log(finalData);
    let finalTeamData = transformDataStructure(divideTeams(finalData));

    res.json({
      success: true,
      data: finalTeamData,
    });
  } catch (error) {
    console.error("Error generating employee query:", error);
    res.json(data);
  }
};

const executeQueries = async (sqlQueries, dbUtils) => {
  try {
    const allResults = await Promise.all(
      sqlQueries.map(async (query) => {
        return await dbUtils.query(query);
      })
    );

    return allResults.map((result) => result.recordset);
  } catch (error) {
    console.error("Error executing queries:", error);
    throw error;
  }
};

const divideTeams = (data) => {
  const specializedTeam = [];
  const currentTeam = [];

  const flattenedData = data.flat();

  flattenedData.forEach((employee) => {
    const hasProjects = employee.ProjectName !== null;
    const hasCertifications = employee.Certifications !== null;

    if (
      employee.Availability === "Not Available" ||
      (hasProjects && hasCertifications)
    ) {
      specializedTeam.push(employee);
    } else {
      currentTeam.push(employee);
    }
  });

  return { specializedTeam, currentTeam };
};

const transformDataStructure = (data) => {
  const transformEmployee = (employee) => ({
    employeeId:
      employee.FirstName.substring(0, 1) +
      employee.LastName.substring(0, 1) +
      "-" +
      employee.Designation,
    name: `${employee.FirstName} ${employee.LastName}`,
    skills: employee.Skills
      ? employee.Skills.split(", ").map((skill) => skill.trim())
      : [],
    yearsOfExperience: null,
    designation: designationFormatter(employee.Designation),
    certifications: employee.Certifications
      ? employee.Certifications.split(", ").map((cert) => cert.trim())
      : [],
    pastProjects: employee.ProjectName ? [employee.ProjectName] : [],
    availability: employee.Availability,
    isRejected: false,
    Gender: employee.Gender == "Male" ? "M" : "F",
  });
  return {
    specializedTeam: data.specializedTeam.map(transformEmployee),
    currentTeam: data.currentTeam.map(transformEmployee),
  };
};


const designationFormatter = (data) => {
  const designations = {
    C: "Consultant",
    A: "Associate",
    M: "Manager"
  };

  if (typeof data !== "string" || data.length < 2) {
    return "Invalid designation code";
  }

  const prefix = data[0]; // Get the first character (C, A, M)
  const level = data.slice(1); // Get the remaining characters (1, 2, etc.)

  if (designations[prefix] && !isNaN(level)) {
    return `${designations[prefix]} ${level}`;
  }

  return "Invalid designation code";
};