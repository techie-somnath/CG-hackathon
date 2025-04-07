import { generate } from "../utils/googleAI.js";

export const getEmployees = async (req, res) => {
  try {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }
    const response = await generate(prompt);
    console.log("Generated Query:", response);
    res?.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Generated Response</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              padding: 20px;
              background-color: #f4f4f9;
              color: #333;
            }
            h1 {
              color: #4CAF50;
            }
            p {
              font-size: 18px;
              line-height: 1.6;
            }
            .prompt {
              font-weight: bold;
              color: #555;
            }
          </style>
        </head>
        <body>
          <h1>Generated Response</h1>
          <p><span class="prompt">Prompt:</span> ${prompt}</p>
          <p><span class="prompt">Response:</span> ${response}</p>
        </body>
        </html>
      `);
  } catch (error) {
    console.error("Error generating employee query:", error);
  }
};