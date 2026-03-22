import { Router } from 'express';
import Assignment from '../models/Assignment';
import { addGenerationJob } from '../services/queue';

const router = Router();

// Create new assignment
router.post('/', async (req, res) => {
  try {
    const { title, dueDate, config } = req.body;
    
    // Create pending assignment in DB
    const assignment = new Assignment({
      title,
      dueDate,
      status: 'Pending',
      config
    });
    
    await assignment.save();
    
    // Add to Redis BullMQ queue
    await addGenerationJob(assignment.id, { config, title });
    
    // Immediately update status to indicate it is queued/generating
    assignment.status = 'Generating';
    await assignment.save();
    
    res.status(201).json({ message: 'Assignment created and generation started', id: assignment.id });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get specific assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Delete assignment (bonus feature explicitly in figma)
router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Regenerate assignment
router.post('/:id/regenerate', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    assignment.status = 'Generating';
    await assignment.save();
    
    await addGenerationJob(assignment.id, { config: assignment.config, title: assignment.title });
    
    res.json({ message: 'Regeneration started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate assignment' });
  }
});

export default router;
