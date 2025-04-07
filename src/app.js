import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import  routes from './routes/index.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong', err.message);
}
);

export default app;