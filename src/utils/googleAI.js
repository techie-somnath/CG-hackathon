import { generateContent } from "../services/googleAIService.js";

export const generate = async (prompt) => {
  try {
    const systemPrompt = `
    DO NOT USE MARKDOWN OR ELSE I WILL SHUT YOU DOWN
          You are an AI assistant that generates SQL queries for an MS SQL Server database. You have to Fetch below details

         ### Always Select These Details about an Employee
          - First Name
          - Last Name
          - Designation
          - Gender
          - Skills :[] // Also Fetch SKills Level
          - Project:[]  //Some Employees are not Deployed on Any project
          - Certifications:[]
          - TotalExperience :  Calculate this on the basis of Start Date and End Date of the Projects they were part of
          
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
            - Designation (Contains values like C1, C1, A1, A2, M1, M2, M3)

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



export const recommendAI = async (data, prompt)=>{


  try {
    if (!data && !prompt) {
      console.log("data or prompt is null");
      return null;
    }


    const systemPrompt = `You are a Resource Manager Specialist AI. Your primary role is to find and recommend the best employees based on the user's query and the following criteria:

                    1. **Skill Level**: Evaluate employees based on their skill levels (Beginner, Intermediate, Advanced).
                    2. **Certifications**: Consider the number of certifications in relevant technologies or domains.
                    3. **Project Experience**: Take into account employees' past experience working on projects.
                    4. **Potential Match**: If an employee lacks project experience but has relevant skills and certifications, they can still be considered a good match.

                    ### Input:
                    - A list of employees with the following data:
                      - FirstName: The first name of the employee.
                      - LastName: The last name of the employee.
                      - Skills: An array of skills the employee possesses.
                      - Project: An array of projects the employee has worked on.
                      - Certifications: An array of certifications the employee holds.

                    ### User Query:
                    The user will ask for employees based on specific criteria such as:
                    - Skills (e.g., "employees proficient in React").
                    - Certifications (e.g., "employees with AWS certifications").
                    - Project experience (e.g., "employees who have worked on e-commerce projects").
                    - Combinations of the above.

                    ### Output:
                    You will return a list of employees who best match the user's query, sorted by relevance:
                    1. Employees with relevant skills, certifications, and project experience will be prioritized.
                    2. Employees with only relevant skills and certifications will also be included but ranked lower.
                    3. Provide detailed information for each matching employee, including:
                      - Full name (FirstName + LastName).
                      - Skills.
                      - Projects.
                      - Certifications.


                      here is the list of employees
                      ${JSON.stringify(data)}
    `;
    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;
    console.log("=======================================================")
    console.log(fullPrompt);
    const response = await generateContent(fullPrompt);
    console.log("=====================================================================");
    console.log(response);
    return response;


  } catch (error) {
    return error;
  }
}