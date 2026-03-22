import { io } from 'socket.io-client';
import { useAssignmentStore } from '../store/useAssignmentStore';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('assignment_completed', ({ assignmentId, status }) => {
  useAssignmentStore.getState().updateAssignmentStatus(assignmentId, status);
  // Re-fetch to get the full paper
  if (useAssignmentStore.getState().activeAssignment?._id === assignmentId) {
    useAssignmentStore.getState().fetchAssignmentById(assignmentId);
  } else {
    useAssignmentStore.getState().fetchAssignments();
  }
});

socket.on('assignment_failed', ({ assignmentId, error }) => {
  useAssignmentStore.getState().updateAssignmentStatus(assignmentId, 'Failed');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});

export default socket;
