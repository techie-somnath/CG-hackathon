import { generateContent } from "../services/googleAIService.js";

export const generate = async (prompt) => {
  try {
    const systemPrompt = `
    You are an AI assistant that generates SQL queries for a database.
    The database contains the following tables:
    1. employees: (id, name, age, department, skills, experience_years)
    2. departments: (id, department_name, manager_id)
    3. projects: (id, project_name, department_id, start_date, end_date)
    4. You have to return me the data from the database in a JSON format.

    Always generate SQL queries based on the user's prompt.
    Ensure the queries are syntactically correct and optimized.
    Respond only with the SQL query unless explicitly asked for an explanation.
  `;

  // Combine the system prompt with the user prompt
  const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${prompt}`;

  // Generate the response
  const response = await generateContent(fullPrompt);
    return response;
  } catch (error) {
    console.error("Response error:", error);
    throw error;
  }
};