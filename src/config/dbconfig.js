import dotenv from 'dotenv';


dotenv.config();

export default  {
  mssql: {
    server: process.env.MSSQL_SERVER || `IN-SOMNATH-GOSW\\SQLEXPRESS`,
    database: process.env.MSSQL_DATABASE || 'MakeMyTeam',
    options: {
      trustedConnection: true,
      driver: 'msnodesqlv8',
      encrypt: false, 
      trustServerCertificate: true,
      enableArithAbort: true
    }
},
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/makemyteam',
  }
};