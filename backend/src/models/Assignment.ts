import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Challenging';
  marks: number;
}

export interface ISection {
  title: string;
  instruction?: string;
  questions: IQuestion[];
}

export interface IAssignment extends Document {
  title: string;
  status: 'Pending' | 'Generating' | 'Completed' | 'Failed';
  dueDate?: Date;
  config: {
    questionTypes: any[];
    totalQuestions: number;
    totalMarks: number;
    additionalInfo?: string;
  };
  paper?: {
    sections: ISection[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard', 'Challenging'], required: true },
  marks: { type: Number, required: true }
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String },
  questions: [QuestionSchema]
});

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Generating', 'Completed', 'Failed'], default: 'Pending' },
  dueDate: { type: Date },
  config: { type: Schema.Types.Mixed, required: true },
  paper: {
    sections: [SectionSchema]
  }
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
