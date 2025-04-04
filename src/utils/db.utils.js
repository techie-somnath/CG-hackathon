import mssql from 'mssql';
import mongoose from 'mongoose';
import dbConfig from '../config/dbconfig.js';

const mssqlPool = new mssql.ConnectionPool(dbConfig.mssql);
mssqlPool.connect().then(() => console.log('Connected to MSSQL')).catch(err => console.error('MSSQL Connection Error:', err));

mongoose.connect(dbConfig.mongo.uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB Connection Error:', err));

 export default {
    mssql,
    mongoose
};