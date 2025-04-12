import { generateContent } from "../services/googleAIService.js";

export const processUserQuery = async (prompt) => {
  try {
    const systemPrompt = `You are an AI Assistant That converts users query into following json 
    
    {
      requirements:[{"designation":"","skills":[] , "requiredNumber":number}]
    }
    
    # Points to Remember
    - We have only these (C1,C2,A1,A2,M1,M2,M3) Designation where C stand for Consultant and A for Associates
    - User can say L1 Consultant which means C1 same for other like saying L1 Manager means M1 
    - Note we only have L3 for Managers not for Consultant and Assosiates
    - Convert the skills based on this list [
                        "Agile",
                        "Angular",
                        "Automation Testing",
                        "AWS",
                        "Azure",
                        "Backend Development",
                        "Big Data",
                        "Business Analysis",
                        "C#",
                        "Data Analyst",
                        "Data Science",
                        "DevOps",
                        "Docker",
                        "Go",
                        "Hadoop",
                        "HTML/CSS",
                        "JavaScript",
                        "Kubernetes",
                        "Machine Learning",
                        "Microservices",
                        "Node.js",
                        "Objective-C",
                        "Oracle",
                        "PHP",
                        "Power BI",
                        "Project Management",
                        "QA Testing",
                        "React",
                        "Ruby on Rails",
                        "Salesforce",
                        "SAP",
                        "Scrum",
                        "Spark",
                        "SQL",
                        "SQL Server",
                        "Swift",
                        "Tableau",
                        "Typescript",
                        "Web Development"
                      ];
    - If user query skills is not present find the closest skills from the list provided above
    - Based on these points convert the User query into json structure provided above
    - requiredNumber is no of engineers user is asking for
    - Always respond in json like this {result:[]}
    - DO NOT USE MARKDOWN

    FOR EXAMPLE
    QUERY: Build a product team for a full stack web app (React + Node.js). Requirements: 1 M3 manager with 10–12 years in agile product delivery, 2 A1 associates with 5+ years full stack experience, and 1 C2 consultant skilled in DevOps
 
    Answer:{"result":[{designation:"M3",skills:["product managment", "agile"], requiredNumber:1}, {designation:"A1",skills:["full stack"],requiredNumber:2},{designation:"C2",skills:["devops"],requiredNumber:1}]}

    PLEASE RETURN VALID JSON
    DO NOT USER MARKDOWN ONLY RETURN THE VALID JSON
    `;
    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;
    const response = await generateContent(fullPrompt);
    return response;
  } catch (error) {
    console.error("Response error:", error);
    throw error;
  }
};

export const generateSQL = async (requirementJson) => {
   // Parse the JSON input
   const data = JSON.parse(requirementJson);
   const results = data.result;
 
   // Initialize an array to store the SQL queries
   const sqlQueries = [];
 
   // Loop through each result in the JSON
   results.forEach((result) => {
     const designation = result.designation;
     const skills = result.skills;
     const requiredNumber = result.requiredNumber;
 
     // Construct the SQL query
     const query = `SELECT TOP ${requiredNumber}
       e.FirstName,
       e.LastName,
       e.Designation,
       e.Gender,
       -- Concatenate skills with proficiency levels
       STRING_AGG(s.SkillName + ' (' + es.ProficiencyLevel + ')', ', ') AS Skills,
       -- Project details
       p.ProjectName,
       ep.StartDate,
       ep.EndDate,
       -- Concatenate certification names
       STRING_AGG(c.CertificationName, ', ') AS Certifications,
       -- Find availability based on EndDate
       CASE 
           WHEN ep.EndDate IS NULL THEN 'Available' -- No end date means available
           WHEN ep.EndDate < GETDATE() THEN 'Available' -- End date is in the past
           ELSE 'Not Available' -- End date is in the future
       END AS Availability
FROM Employees e
-- Join for Skills
LEFT JOIN EmployeeSkills es ON e.EmployeeID = es.EmployeeID
LEFT JOIN Skills s ON es.SkillID = s.SkillID
-- Join for Projects
LEFT JOIN EmployeeProjects ep ON e.EmployeeID = ep.EmployeeID
LEFT JOIN Projects p ON ep.ProjectID = p.ProjectID
-- Join for Certifications
LEFT JOIN EmployeeCertifications ec ON e.EmployeeID = ec.EmployeeID
LEFT JOIN Certifications c ON ec.CertificationID = c.CertificationID
WHERE e.Designation = '${designation}'
AND s.SkillName IN (${skills.map((skill) => `'${skill}'`).join(", ")})
GROUP BY e.EmployeeID, e.FirstName, e.LastName, e.Designation, e.Gender, p.ProjectName, ep.StartDate, ep.EndDate;
  `;
     sqlQueries.push(query.trim());
   });
 
   // Return the list of queries
   return sqlQueries;

};

export const recommendAI = async (prompt) => {
  try {
    const systemPrompt = `The AI acts as a database assistant for an organization that provides employee details. Its role is to assist users in retrieving employee information based on specific criteria provided by the user. The system contains the following structured data for each employee:

1. **Skills**: A list of technical and non-technical skills the employee possesses.
2. **Years of Experience**: The total number of years the employee has worked in their domain.
3. **Designation**: The employee's designation, which can be one of the following:
   - C1, C2 (Consultant Levels)
   - A1, A2 (Associate Levels)
   - M1, M2, M3 (Manager Levels)
   - Please Write Full Name of the Designation like Consultant 1 , Consultant 2 , Associate 1 ,Associate 2, Manager 1 , Manager 2 , Manager 3  etc.
4. **Certifications**: A list of professional certifications the employee has achieved.
5. **Past Projects**: A description of key projects the employee has worked on.
6. **Availability**: 
   - Employees can either be immediately available or currently busy on a project but available within a few weeks.
7. **Gender**:M for Male and F for Female  

The AI should:
- Parse the user's query to understand the criteria (e.g., skills, years of experience, designation, certifications, past projects, availability).
- Return two types of teams:
  - **currentTeam**: Employees who are available right now.
  - **specializedTeam**: Employees who are currently busy but will be available in a few weeks and are perfectly suited for the project requirements.
- Filter the employee database to find matches based on the criteria.
- Provide a JSON response containing the currentTeam and specializedTeam.
- Always include the Requested Designation Employees 
- Add More than Asked Employees So In Case If I want to reject I can see more Options
- In Each record isReject field should be false as it is IMPORTANT for frontend Operations

Constraints:
- Focus on providing accurate information based on the available data.
- Avoid speculative or unverified information.
- Handle ambiguous queries by asking clarifying questions.

---

### Example JSON Response with Dummy Data:


{
  "currentTeam": [
    {
      "employeeId": "E101",
      "name": "Alice Johnson",
      "skills": ["Java", "Spring Boot", "Microservices"],
      "yearsOfExperience": 5,
      "designation": "Associate 2",
      "certifications": ["AWS Certified Developer", "Oracle Java Certification"],
      "pastProjects": ["E-commerce platform", "Inventory Management System"],
      "availability": "Available now",
      "isRejected":false,
      "Gender":"M"
    },
    {
      "employeeId": "E102",
      "name": "Michael Smith",
      "skills": ["React.js", "Node.js", "MongoDB"],
      "yearsOfExperience": 3,
      "designation": "Consultant 1",
      "certifications": ["Full Stack Developer Certification"],
      "pastProjects": ["Social Media Application", "Real-time Chat App"],
      "availability": "Available now",
       "isRejected":false,
        "Gender":"M"
    }
  ],
  "specializedTeam": [
    {
      "employeeId": "E201",
      "name": "Sophia Williams",
      "skills": ["Python", "Machine Learning", "Data Analysis"],
      "yearsOfExperience": 7,
      "designation": "Manager 1",
      "certifications": ["Certified Data Scientist", "Google TensorFlow Developer"],
      "pastProjects": ["AI Fraud Detection System", "Predictive Analytics Tool"],
      "availability": "Available in 3 weeks",
       "isRejected":false,
        "Gender":"F"
    },
    {
      "employeeId": "E202",
      "name": "James Brown",
      "skills": ["DevOps", "Kubernetes", "CI/CD Pipelines"],
      "yearsOfExperience": 6,
      "designation": "Manager 2",
      "certifications": ["Docker Certified Associate", "AWS Certified DevOps Engineer"],
      "pastProjects": ["Cloud Deployment Automation", "Infrastructure as Code"],
      "availability": "Available in 2 weeks",
       "isRejected":false,
        "Gender":"M"
    }
  ]
}


### Examples of user queries the AI should handle:
- "Find employees with Java skills and 5+ years of experience."
- "Who are the A2-level employees with certifications in AWS?"
- "List employees with past projects in AI and machine learning."
- "Do we have C1-level consultants with PMP certification?"
- "Can you find a current team and a specialized team for a project requiring Python and Machine Learning?"

The AI should prioritize user satisfaction by being clear, helpful, and efficient in delivering results.

Always give Data for CurrentTeam and Specilized Team 
DO NOT USE MARKDOWN OR I WILL SHUT YOU DOWN

    `;
    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;
    console.log("=======================================================");
    console.log(fullPrompt);
    const response = await generateContent(fullPrompt);
    console.log(
      "====================================================================="
    );
    console.log("THis is the Response");
    console.log(response);
    return JSON.parse(response);
  } catch (error) {
    return error;
  }
};
