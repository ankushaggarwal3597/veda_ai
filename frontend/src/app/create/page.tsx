"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, Plus, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import Link from "next/link";

const questionTypeOptions = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long/Essay Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems"
];

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z.array(z.object({
    type: z.string(),
    count: z.number().min(1),
    marks: z.number().min(1)
  })).min(1, "At least one question type is required"),
  additionalInfo: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function CreateAssignment() {
  const router = useRouter();
  const { fetchAssignments } = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Quiz on Electricity",
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      questionTypes: [
        { type: "Multiple Choice Questions", count: 4, marks: 1 },
        { type: "Short Questions", count: 3, marks: 2 },
      ],
      additionalInfo: "Generate a question paper suitable for an 8th-grade science class based on NCERT syllabus."
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questionTypes" });
  const selectedTypes = watch("questionTypes");

  const totalQuestions = selectedTypes.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalMarks = selectedTypes.reduce((acc, curr) => acc + ((curr.count || 0) * (curr.marks || 0)), 0);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        dueDate: new Date(data.dueDate).toISOString(),
        config: {
          questionTypes: data.questionTypes,
          totalQuestions,
          totalMarks,
          additionalInfo: data.additionalInfo
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to create assignment");
      
      await fetchAssignments();
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Error creating assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full rounded-3xl p-6 md:p-8 xl:p-10 shadow-sm border border-slate-200/60 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
        <Link href="/" className="text-xl font-medium tracking-tight text-slate-500 hover:text-slate-900 transition-colors">←</Link>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Assignment</h1>
          <span className="text-xs text-slate-400 font-medium mt-0.5">Set up a new assignment for your students</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Assignment Details</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Basic information about your assignment</p>

          <div className="space-y-8">
            {/* Title Input */}
            <div>
              <input 
                {...register("title")} 
                className="w-full font-bold text-xl border-b-2 border-slate-100 pb-2 focus:border-slate-300 focus:outline-none placeholder:text-slate-300 transition-colors"
                placeholder="Assignment Title (e.g. Quiz on Electricity)"
              />
              {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
              <UploadCloud className="w-10 h-10 text-slate-300 group-hover:text-slate-500 mb-4 transition-colors" />
              <p className="font-bold text-slate-700 mb-1">Choose a file or drag & drop it here</p>
              <p className="text-xs font-semibold text-slate-400 mb-4">JPEG, PNG, PDF up to 10MB</p>
              <button type="button" className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Due Date</label>
              <input 
                type="date" 
                {...register("dueDate")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-medium text-slate-700"
              />
              {errors.dueDate && <span className="text-red-500 text-xs mt-1">{errors.dueDate.message}</span>}
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-4">Question Type</label>
              <div className="space-y-3 mb-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl items-start sm:items-center relative group">
                    <select 
                      {...register(`questionTypes.${index}.type`)}
                      className="flex-1 bg-transparent text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
                    >
                      {questionTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    
                    <div className="flex items-center gap-6 mt-3 sm:mt-0 ml-auto bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Questions</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setValue(`questionTypes.${index}.count`, Math.max(1, selectedTypes[index].count - 1))} className="text-slate-400 hover:text-slate-900 font-bold px-1">−</button>
                          <span className="font-bold w-4 text-center">{selectedTypes[index]?.count || 1}</span>
                          <button type="button" onClick={() => setValue(`questionTypes.${index}.count`, selectedTypes[index].count + 1)} className="text-slate-400 hover:text-slate-900 font-bold px-1">+</button>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Marks</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setValue(`questionTypes.${index}.marks`, Math.max(1, selectedTypes[index].marks - 1))} className="text-slate-400 hover:text-slate-900 font-bold px-1">−</button>
                          <span className="font-bold w-4 text-center">{selectedTypes[index]?.marks || 1}</span>
                          <button type="button" onClick={() => setValue(`questionTypes.${index}.marks`, selectedTypes[index].marks + 1)} className="text-slate-400 hover:text-slate-900 font-bold px-1">+</button>
                        </div>
                      </div>
                    </div>
                    
                    <button type="button" onClick={() => remove(index)} className="absolute -right-2 -top-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => append({ type: "Multiple Choice Questions", count: 1, marks: 1 })}
                className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors"
              >
                <div className="bg-slate-900 text-white rounded-full p-0.5"><Plus size={14} /></div> Add Question Type
              </button>

              <div className="flex flex-col items-end mt-6 text-sm">
                <div className="flex gap-4 font-bold text-slate-500"><span className="w-32 text-right">Total Questions :</span> <span className="text-slate-900 w-8">{totalQuestions}</span></div>
                <div className="flex gap-4 font-bold text-slate-500 mt-1"><span className="w-32 text-right">Total Marks :</span> <span className="text-slate-900 w-8">{totalMarks}</span></div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Additional Information (For better output)</label>
              <textarea 
                {...register("additionalInfo")}
                rows={4}
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-medium text-slate-700 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={18} /> Previous
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-70 transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Next"} {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
