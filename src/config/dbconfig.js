import dotenv from 'dotenv';

dotenv.config();

export default  {
  mssql: {
    user: 'sa',
    password: 'Cyber1234',
    server: process.env.MSSQL_SERVER || `IN-SOMNATH-GOSW\\SQLEXPRESS`,
    database: process.env.MSSQL_DATABASE || 'MakeMyTeam',
    options: {
      trustedConnection: true,
      encrypt: false, 
      trustServerCertificate: true,
      enableArithAbort: true
    }
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/makemyteam',
  }
};