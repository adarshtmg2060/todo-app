import app from './app';
import dotenv from 'dotenv';
// import checkDbConnection from "./config/dbconnection";

dotenv.config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;


const startServer = async () => {
  // Check database connection before starting the server
  // await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

startServer();
