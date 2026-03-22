import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { initSocket } from './services/socket';
import dotenv from 'dotenv';
import assignmentRoutes from './routes/assignmentRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// Pass io to request so routes/controllers can use it if needed
app.set('io', io);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vedaai';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
