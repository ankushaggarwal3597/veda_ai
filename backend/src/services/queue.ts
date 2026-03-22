import { Queue, Worker, Job } from 'bullmq';
import Assignment from '../models/Assignment';
import { generateQuestions } from './ai';
import { getIo } from './socket';

// 🔥 Redis Connection Config (NO ioredis instance)
const connection = process.env.REDIS_URL
  ? {
      url: process.env.REDIS_URL,
      tls: {}, // ✅ Required for Upstash (SSL)
    }
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    };

// 🔥 Queue
export const generationQueue = new Queue('assignment-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// 🔥 Add Job Function
export const addGenerationJob = async (assignmentId: string, data: any) => {
  await generationQueue.add('generate-assignment', {
    assignmentId,
    ...data,
  });
};

// 🔥 Worker
const worker = new Worker(
  'assignment-generation',
  async (job: Job) => {
    const { assignmentId, config, title } = job.data;

    console.log(`Processing job for assignment ${assignmentId} - ${title}`);

    try {
      // Generate questions via AI
      const paperStructure = await generateQuestions(config, title);

      // Update DB
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found during job processing');
      }

      assignment.paper = paperStructure;
      assignment.status = 'Completed';
      await assignment.save();

      // Emit WebSocket event
      getIo()?.emit('assignment_completed', {
        assignmentId,
        status: 'Completed',
      });

      console.log(`Job completed for assignment ${assignmentId}`);
    } catch (error: any) {
      console.error(`Failed to generate assignment ${assignmentId}:`, error.message);

      const assignment = await Assignment.findById(assignmentId);
      if (assignment) {
        assignment.status = 'Failed';
        await assignment.save();

        getIo()?.emit('assignment_failed', {
          assignmentId,
          error: error.message,
        });
      }

      throw error; // BullMQ handles retries
    }
  },
  {
    connection,
    concurrency: 5, // process multiple jobs
  }
);

// 🔥 Worker Events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed ✅`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed ❌: ${err.message}`);
});

worker.on('error', (err) => {
  console.error('Worker error ❌:', err.message);
});

export default worker;