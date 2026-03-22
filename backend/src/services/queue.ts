import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import Assignment from '../models/Assignment';
import { generateQuestions } from './ai';
import { getIo } from './socket';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
}) as any;

connection.on('error', (err: any) => {
  console.error('Redis connection error:', err.message);
});

export const generationQueue = new Queue('assignment-generation', { connection });

export const addGenerationJob = async (assignmentId: string, data: any) => {
  await generationQueue.add('generate-assignment', { assignmentId, ...data });
};

// Background Worker
const worker = new Worker('assignment-generation', async (job: Job) => {
  const { assignmentId, config, title } = job.data;
  console.log(`Processing job for assignment ${assignmentId} - ${title}`);

  try {
    // Generate questions via AI
    const paperStructure = await generateQuestions(config, title);

    // Update Document
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found during job processing');
    }

    assignment.paper = paperStructure;
    assignment.status = 'Completed';
    await assignment.save();

    // Emit websocket event safely
    getIo()?.emit('assignment_completed', { assignmentId, status: 'Completed' });
    console.log(`Job completed for assignment ${assignmentId}`);

  } catch (error: any) {
    console.error(`Failed to generate assignment ${assignmentId}:`, error);

    const assignment = await Assignment.findById(assignmentId);
    if (assignment) {
      assignment.status = 'Failed';
      await assignment.save();
      getIo()?.emit('assignment_failed', { assignmentId, error: error.message });
    }

    throw error; // Let BullMQ handle retry / failure logging
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job Worker failed for ${job?.id} with error ${err.message}`);
});

export default worker;
