import dbUtils from "../utils/db.utils.js";

const { mssql } = dbUtils;

export const getAllEmployees = async (req, res) => {
  try {
    console.log(mssql);
    const request = mssql.request();
    const result = await request.query('SELECT * FROM [dbo].[Employee]');
    
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};