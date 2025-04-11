import { generate } from "../utils/googleAI.js";
import  mssql from "../utils/db.utils.js";

export const getEmployees = async (req, res) => {
  try {
    const {prompt}  = req.body;

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }
    const response = await generate(prompt);

    console.log(response);
    const data= JSON.parse(response);
    const result = await mssql.query(data.sql); 
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error generating employee query:", error);
  }
};