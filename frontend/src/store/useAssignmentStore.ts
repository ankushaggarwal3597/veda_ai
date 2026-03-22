import { create } from 'zustand';

export interface Question {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Challenging';
  marks: number;
}

export interface Section {
  title: string;
  instruction?: string;
  questions: Question[];
}

export interface Assignment {
  _id: string;
  title: string;
  status: 'Pending' | 'Generating' | 'Completed' | 'Failed';
  dueDate?: string;
  config: {
    questionTypes: any[];
    totalQuestions: number;
    totalMarks: number;
    additionalInfo?: string;
  };
  paper?: {
    sections: Section[];
  };
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: Assignment[];
  activeAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignmentStatus: (id: string, status: string, paper?: any) => void;
  setActiveAssignment: (assignment: Assignment | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  activeAssignment: null,
  isLoading: false,
  error: null,

  setAssignments: (assignments) => set({ assignments }),
  
  addAssignment: (assignment) => set((state) => ({ 
    assignments: [assignment, ...state.assignments] 
  })),

  updateAssignmentStatus: (id, status, paper) => set((state) => ({
    assignments: state.assignments.map(a => 
      a._id === id ? { ...a, status: status as any, ...(paper ? { paper } : {}) } : a
    ),
    activeAssignment: state.activeAssignment?._id === id 
      ? { ...state.activeAssignment, status: status as any, ...(paper ? { paper } : {}) }
      : state.activeAssignment
  })),

  setActiveAssignment: (assignment) => set({ activeAssignment: assignment }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('http://localhost:3001/api/assignments');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ assignments: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAssignmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`http://localhost:3001/api/assignments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ activeAssignment: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteAssignment: async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/assignments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      set((state) => ({
        assignments: state.assignments.filter(a => a._id !== id),
        activeAssignment: state.activeAssignment?._id === id ? null : state.activeAssignment
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
