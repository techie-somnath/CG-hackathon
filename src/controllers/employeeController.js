import { generate, recommendAI } from "../utils/googleAI.js";
import mssql from "../utils/db.utils.js";

export const getEmployees = async (req, res) => {

  const data={
    "currentTeam": [
      {
        "employeeId": "E101",
        "name": "Alice Johnson",
        "skills": ["Java", "Spring Boot", "Microservices"],
        "yearsOfExperience": 5,
        "designation": "A2",
        "certifications": ["AWS Certified Developer", "Oracle Java Certification"],
        "pastProjects": ["E-commerce platform", "Inventory Management System"],
        "availability": "Available now",
        "isRejected":false
      },
      {
        "employeeId": "E102",
        "name": "Michael Smith",
        "skills": ["React.js", "Node.js", "MongoDB"],
        "yearsOfExperience": 3,
        "designation": "C1",
        "certifications": ["Full Stack Developer Certification"],
        "pastProjects": ["Social Media Application", "Real-time Chat App"],
        "availability": "Available now",
        "isRejected":false
      }
    ],
    "specializedTeam": [
      {
        "employeeId": "E201",
        "name": "Sophia Williams",
        "skills": ["Python", "Machine Learning", "Data Analysis"],
        "yearsOfExperience": 7,
        "designation": "M1",
        "certifications": ["Certified Data Scientist", "Google TensorFlow Developer"],
        "pastProjects": ["AI Fraud Detection System", "Predictive Analytics Tool"],
        "availability": "Available in 3 weeks",
        "isRejected":false
      },
      {
        "employeeId": "E202",
        "name": "James Brown",
        "skills": ["DevOps", "Kubernetes", "CI/CD Pipelines"],
        "yearsOfExperience": 6,
        "designation": "M2",
        "certifications": ["Docker Certified Associate", "AWS Certified DevOps Engineer"],
        "pastProjects": ["Cloud Deployment Automation", "Infrastructure as Code"],
        "availability": "Available in 2 weeks",
        "isRejected":false
      }
    ]
  }
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }
    console.log("Returning Data");
    res.json({success:"true",data})
    //  let employeeResult= await recommendAI(prompt);
    // console.log("=================================================")
    // console.log("Recommended Employees")
    // console.log("=====================================================")
    // console.log(employeeResult);
    // res.json({
    //   success: true,
    //   data: employeeResult
    // });

    // return data;
  } catch (error) {
    console.error("Error generating employee query:", error);
    res.json(data)
    // return res.status(500).send("Internal Server Error",error);
  }
};
