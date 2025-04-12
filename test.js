// ../controllers/employeeController.js
import { genAIModel, modelSafetySettings } from "../utils/googleAI.js"; // Import model
import dbUtils from "../utils/db.utils.js";
import { FunctionDeclarationSchemaType, Part } from "@google/generative-ai";

// --- Define the Function Declaration for Gemini ---
const findEmployeesFunctionDeclaration = {
    name: "findEmployeesInDB",
    description: "Searches the employee database based on provided criteria like skills, experience, designation, availability, or past projects.",
    parameters: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
            skills: {
                type: FunctionDeclarationSchemaType.ARRAY,
                items: { type: FunctionDeclarationSchemaType.STRING },
                description: "List of skills the employee should possess (e.g., ['Java', 'Spring Boot']).",
            },
            minYearsExperience: {
                type: FunctionDeclarationSchemaType.NUMBER,
                description: "Minimum years of work experience required.",
            },
            maxYearsExperience: {
                type: FunctionDeclarationSchemaType.NUMBER,
                description: "Maximum years of work experience allowed.",
            },
            designation: {
                type: FunctionDeclarationSchemaType.STRING,
                description: "The job title or designation of the employee (e.g., 'Manager 1', 'Consultant 2').",
            },
            availability: {
                type: FunctionDeclarationSchemaType.STRING,
                description: "Current availability status (e.g., 'Available now', 'Available in 2 weeks').",
            },
             gender: {
                type: FunctionDeclarationSchemaType.STRING,
                description: "Gender of the employee (e.g. 'M', 'F')."
             }
        },
        required: ["skills","designation","availability","gender"]
    },
};

// --- Implement the Actual Function to Query the Database ---
// IMPORTANT: This function MUST handle database interaction securely.
const findEmployeesInDB = async (args) => {
    console.log("Executing findEmployeesInDB with args:", args);
    try {
        // Base query
        let sql = `SELECT employeeId, name, skills, yearsOfExperience, designation, certifications, pastProjects, availability, Gender FROM employees WHERE 1=1`; // Adjust table/column names
        const params = [];

        // Dynamically build WHERE clauses based on provided arguments
        if (args.skills && args.skills.length > 0) {
            // This part heavily depends on how 'skills' are stored (JSON array, comma-separated string, separate table?)
            // Example for JSON array (MySQL):
            args.skills.forEach(skill => {
                // Be cautious with dynamic column/table names or complex JSON queries. Parameterize values only.
                // A safer approach might be needed depending on DB and complexity
                sql += ` AND JSON_CONTAINS(skills, ?)`; // Assumes skills is a JSON array like ["Java", "SQL"]
                 params.push(JSON.stringify(skill)); // Need to stringify for JSON_CONTAINS parameter
                 // Alternative for simple comma-separated: sql += ` AND FIND_IN_SET(?, skills)`; params.push(skill);
                // Alternative for separate skills table requires JOINs
            });
             // Example for comma-separated string (less ideal):
             // args.skills.forEach(skill => {
             //     sql += ` AND FIND_IN_SET(?, skills) > 0`;
             //     params.push(skill);
             // });
        }
        if (args.minYearsExperience !== undefined) {
            sql += ` AND yearsOfExperience >= ?`;
            params.push(args.minYearsExperience);
        }
        if (args.maxYearsExperience !== undefined) {
            sql += ` AND yearsOfExperience <= ?`;
            params.push(args.maxYearsExperience);
        }
        if (args.designation) {
            sql += ` AND designation = ?`;
            params.push(args.designation);
        }
        if (args.availability) {
            sql += ` AND availability = ?`;
            params.push(args.availability);
        }
         if (args.gender) {
            sql += ` AND Gender = ?`;
            params.push(args.gender);
        }
        // Add clauses for pastProjects, certifications etc. similarly if needed

        console.log("Executing SQL:", sql);
        console.log("With Parameters:", params);

        // *** CRITICAL: Ensure dbUtils.query supports parameterized queries ***
        const results = await dbUtils.query(sql, params);

        console.log("Database query results:", results);
        // Return data in a format Gemini can understand for the functionResponse
        return { employees: results };

    } catch (error) {
        console.error("Error in findEmployeesInDB:", error);
        // Return an error structure that Gemini might be able to report
        return { error: "Failed to query database.", details: error.message };
    }
};

// --- Controller using Function Calling ---
export const getEmployees = async (req, res) => {
    const { prompt } = req.body;
    // Optional: Add conversation history if you want multi-turn interactions
    // const history = req.body.history || [];

    if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    try {
        const chat = genAIModel.startChat({
            // history: history, // Pass history if using multi-turn
            tools: [{ functionDeclarations: [findEmployeesFunctionDeclaration] }],
            safetySettings: modelSafetySettings,
        });

        console.log("Sending prompt to Gemini:", prompt);
        const result = await chat.sendMessage(prompt);
        const response = result.response;

        console.log("Gemini initial response:", JSON.stringify(response, null, 2));

        // Check if Gemini wants to call the function
        const functionCalls = response.functionCalls(); // Use functionCalls() which returns an array

        if (functionCalls && functionCalls.length > 0) {
             // Currently handle only the first call if multiple are returned (unlikely for simple cases)
             const call = functionCalls[0];
            console.log("Gemini requested function call:", call);

            if (call.name === "findEmployeesInDB") {
                // Extract arguments provided by Gemini
                const args = call.args;

                // *** Call your actual database function ***
                const functionResult = await findEmployeesInDB(args);

                console.log("Result from findEmployeesInDB:", functionResult);

                // Send the function's result back to Gemini
                const result2 = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: "findEmployeesInDB",
                            response: functionResult, // Send back the data (or error)
                        },
                    },
                ]); // Need to cast to Part[] type

                const finalResponse = result2.response;
                 console.log("Gemini final response after function execution:", JSON.stringify(finalResponse, null, 2));

                // Option 1: Return the structured data directly from your function
                // Check if your function returned data or an error
                 if (functionResult.error) {
                     // Maybe let Gemini summarize the error, or return it directly
                     return res.status(500).json({ success: false, error: "Database query failed", details: functionResult.error });
                 }
                 // If the function succeeded, return the employee data
                return res.json({
                     success: true,
                     message: finalResponse.text() || "Successfully retrieved employees.", // Get Gemini's summary text
                     data: functionResult.employees // Return the raw data from DB
                 });


                // Option 2: Return Gemini's text summary of the results
                // return res.json({
                //     success: true,
                //     message: "Data processed via function call.",
                //     data: finalResponse.text() // Return Gemini's final text response
                // });

            } else {
                console.warn("Gemini called an unexpected function:", call.name);
                return res.status(500).json({ success: false, error: "AI called an unknown function." });
            }
        } else {
            // Gemini did not call the function, return its text response
            console.log("Gemini responded directly (no function call):");
            const text = response.text();
             return res.json({
                success: true,
                message: "Received direct response from AI.",
                data: text // Return Gemini's direct text response
            });
        }

    } catch (error) {
        console.error("Error in getEmployees controller:", error);
         // Check for specific Gemini errors (e.g., safety blocks)
        if (error.message.includes('SAFETY')) {
             return res.status(400).json({ success: false, error: "Request blocked due to safety settings.", details: error.message });
        }
        // Fallback using the hardcoded data if absolutely necessary (better to fix the root cause)
        // console.warn("Using hardcoded fallback data due to error.");
        // const fallbackData = { /* your fallback data */ };
        // return res.json({ success: false, error: "Internal Server Error (using fallback)", data: fallbackData });

        return res.status(500).json({ success: false, error: "Internal Server Error", details: error.message });
    }
};