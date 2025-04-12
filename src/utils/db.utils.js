import mssql from 'mssql/msnodesqlv8.js';
import mongoose from 'mongoose';
import dbConfig from '../config/dbconfig.js';


const mssqlPool = new mssql.ConnectionPool(dbConfig.mssql);
const mssqlPoolConnect = mssqlPool.connect();

async function query(sqlQuery) {
  try {
    await mssqlPoolConnect;
    const request = mssqlPool.request();
    const result = await request.query(sqlQuery);
    // console.log(result);
    return result;
  } catch (err) {
    console.error('SQL Query Error:', err);
    throw err;
  }
}

mongoose.connect(dbConfig.mongo.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB Connection Error:', err));

 export default {
  query,
  mssql: mssqlPool,
  mongoose
};