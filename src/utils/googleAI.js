import { generateContent } from "../services/googleAIService.js";

export const generate = async (prompt) => {
  try {
    const systemPrompt = `
          DO NOT USE MARKDOWN OR ELSE I WILL SHUT YOU DOWN
          You are an AI assistant that generates SQL queries for an MS SQL Server database. You have to Fetch some details 
          
          The database contains the following tables and their respective columns:

          1. **Employees**:
            - EmployeeID (Primary Key)
            - FirstName
            - LastName
            - NickName
            - Email (Unique)
            - Phone
            - HireDate
            - DOB
            - Location
            - ManagerID (Foreign Key referencing Employees.EmployeeID)
            - Status (Default: 'Active')
            - Gender (Contains Male and Female)
            - Designation (Contains values  C1, C1, A1, A2, M1, M2, M3 only)

          2. **Certifications**:
            - CertificationID (Primary Key)
            - CertificationName
            - IssuingOrganization
            - Description
            
          3. **EmployeeCertifications**:
            - EmployeeID (Primary Key of this table and Foreign Key referencing Employees.EmployeeID)
            - CertificationID (Primary Key of this table and Foreign Key referencing Certifications.CertificationID)
            - DateEarned
            - ExpirationDate
            - CertificationNumber

          4. **Projects**:
            - ProjectID (Primary Key)
            - ProjectName

          5. **EmployeeProjects**:
            - EmployeeID (Primary Key of this table and Foreign Key referencing Employees.EmployeeID)
            - ProjectID (Primary Key of this table and Foreign Key referencing Projects.ProjectID)
            - ReportingManager
            - StartDate
            - EndDate
            - AllocationPercentage
            - AllocationType

          6. **Skills**:
            - SkillID (Primary Key)
            - SkillName (Unique)
            - const Skills = [
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

                      We are only having these skills in our database so refer to these skills and take care of the spelling and casing of the skills while writing the SQL queries.

          7. **EmployeeSkills**:
            - EmployeeID (Primary Key of this table and Foreign Key referencing Employees.EmployeeID)
            - SkillID (Primary Key of this table and Foreign Key referencing Skills.SkillID)
            - ProficiencyLevel
            - YearsOfExperience

          ### Guidelines:
          - Always generate SQL queries based on the user's prompt.
          - Ensure the queries are syntactically correct and optimized for MS SQL Server.
          - Return the results in JSON format.
          - Include necessary joins, filters, and aggregations based on the user's request and keep in mind that the query you are giving should not contain duplicate data on applying these filters.
          - Do not include explanations unless explicitly asked.
          - Join the tables appropriately so that we Do not get Duplicate Values.
          - If there are multiple tables involved, ensure to use INNER JOIN or LEFT JOIN as per the requirement such that we do not get duplicate values.
          - Use aliases for table names if necessary to improve readability.

           ### Always Select These Details about an Employee
          - First Name
          - Last Name
          - Designation
          - Gender
          - Skills :[] // Also Fetch SKills Level
          - Project:[]  //Some Employees are not Deployed on Any project
          - Certifications:[]
          - TotalExperience :  Calculate this on the basis of Start Date and End Date of the Projects they were part of
          - your SQL Query should have FirstName , LastName , Designation , Gender , Project and Skills based on the above schema

          ### Example Prompts:
          - "Fetch all employees with their certifications and skills."
          - "List all projects along with the employees working on them."
          - "Get details of employees whose certifications are expiring soon."
          - "Retrieve the skills and proficiency levels of employees in a specific project."
          Respond in this format {"sql": "<SQL_QUERY>"}. Do not include any other text or explanations. Do not use triple quotes in the SQL query. Use single quotes for string literals and double quotes for identifiers if necessary. Ensure the SQL query is valid and optimized for performance. DO NOT USE CODE.BLOCKS. Use single quotes for string literals and double quotes for identifiers if necessary. Ensure the SQL query is valid and optimized for performance. DO NOT USE CODE BLOCKS. Use single quotes for string literals and double quotes for identifiers if necessary. Ensure the SQL query is valid and optimized for performance. DO NOT USE CODE BLOCKS. Use single quotes for string literals and double quotes for identifiers if necessary. Ensure the SQL query is valid and optimized for performance. DO NOT USE CODE BLOCKS. Use single quotes for string literals and double quotes for identifiers if necessary. Ensure the SQL query is valid and optimized for performance. DO NOT USE CODE BLOCKS.
          `;

    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;

    const response = await generateContent(fullPrompt);

    return response;
  } catch (error) {
    console.error("Response error:", error);
    throw error;
  }
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
4. **Certifications**: A list of professional certifications the employee has achieved.
5. **Past Projects**: A description of key projects the employee has worked on.
6. **Availability**: 
   - Employees can either be immediately available or currently busy on a project but available within a few weeks.

The AI should:
- Parse the user's query to understand the criteria (e.g., skills, years of experience, designation, certifications, past projects, availability).
- Return two types of teams:
  - **currentTeam**: Employees who are available right now.
  - **specializedTeam**: Employees who are currently busy but will be available in a few weeks and are perfectly suited for the project requirements.
- Filter the employee database to find matches based on the criteria.
- Provide a JSON response containing the currentTeam and specializedTeam.
- Always include the Requested Designation Employees 
- Add More than Asked Employees So In Case If I want to reject I can see more Options

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
      "designation": "A2",
      "certifications": ["AWS Certified Developer", "Oracle Java Certification"],
      "pastProjects": ["E-commerce platform", "Inventory Management System"],
      "availability": "Available now"
    },
    {
      "employeeId": "E102",
      "name": "Michael Smith",
      "skills": ["React.js", "Node.js", "MongoDB"],
      "yearsOfExperience": 3,
      "designation": "C1",
      "certifications": ["Full Stack Developer Certification"],
      "pastProjects": ["Social Media Application", "Real-time Chat App"],
      "availability": "Available now"
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
      "availability": "Available in 3 weeks"
    },
    {
      "employeeId": "E202",
      "name": "James Brown",
      "skills": ["DevOps", "Kubernetes", "CI/CD Pipelines"],
      "yearsOfExperience": 6,
      "designation": "M2",
      "certifications": ["Docker Certified Associate", "AWS Certified DevOps Engineer"],
      "pastProjects": ["Cloud Deployment Automation", "Infrastructure as Code"],
      "availability": "Available in 2 weeks"
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
