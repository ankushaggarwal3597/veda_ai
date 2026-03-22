"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { Download, ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import socket from "@/lib/socket";

export default function AssignmentOutput() {
  const { id } = useParams();
  const router = useRouter();
  const { activeAssignment, fetchAssignmentById, isLoading } = useAssignmentStore();

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id as string);
    }
  }, [id, fetchAssignmentById]);

  // Optionally ensure socket connection
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  if (isLoading || !activeAssignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl m-4">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-medium tracking-tight">Loading Assessment Paper...</p>
      </div>
    );
  }

  const { title, status, config, paper } = activeAssignment;
  const isGenerating = status === 'Generating' || status === 'Pending';
  const isFailed = status === 'Failed';

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = async () => {
    try {
      if (activeAssignment?._id) {
        useAssignmentStore.getState().updateAssignmentStatus(activeAssignment._id, 'Generating');
        await fetch(`http://localhost:3001/api/assignments/${activeAssignment._id}/regenerate`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed to regenerate');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full rounded-3xl p-6 md:p-8 xl:p-10 shadow-sm border border-slate-200/60 overflow-y-auto">
      {/* Header (Hidden when printing via CSS) */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xl font-medium tracking-tight text-slate-500 hover:text-slate-900 transition-colors">←</button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate max-w-[300px]">Create New</h1>
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col pt-2">
        {/* Dark Top Action Bar (Hidden when printing via CSS) */}
        {!isGenerating && !isFailed && (
          <div className="bg-slate-900 text-white rounded-t-3xl p-6 xl:p-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6 print:hidden shadow-md z-10 relative">
            <p className="text-lg/snug font-medium text-slate-100 max-w-xl">
              Certainly, John! Here is the customized Question Paper based on your requested configuration:
            </p>
            <div className="flex items-center justify-center lg:justify-end gap-3 shrink-0">
              <button 
                onClick={handleRegenerate}
                className="flex items-center justify-center gap-2 bg-slate-800 text-white border border-slate-700 rounded-full py-2.5 px-6 font-bold hover:bg-slate-700 transition-colors shadow-sm active:scale-95 duration-200"
              >
                <RefreshCcw size={18} className="text-slate-300" /> Regenerate
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-white text-slate-900 rounded-full py-2.5 px-6 font-bold hover:bg-slate-100 transition-colors shadow-sm active:scale-95 duration-200"
              >
                <Download size={18} className="text-slate-600" /> Download PDF
              </button>
            </div>
          </div>
        )}

        {isGenerating ? (
           <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center border border-slate-100 shadow-sm mt-4">
             <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Loader2 size={32} className="animate-spin" />
             </div>
             <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Generating your questions...</h2>
             <p className="text-slate-500 font-medium text-center max-w-md">Our AI is analyzing the configurations and generating the optimal test sections. This may take up to 30 seconds.</p>
           </div>
        ) : isFailed ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center border border-red-100 shadow-sm mt-4">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-2xl font-bold">!</span>
             </div>
             <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Generation Failed</h2>
             <p className="text-slate-500 font-medium text-center">Something went wrong while generating the questions. Please verify your LLM key if applicable.</p>
             <Link href="/create" className="mt-8 flex items-center gap-2 bg-slate-900 text-white rounded-full py-2.5 px-6 font-semibold hover:bg-slate-800 transition-colors shadow-sm active:scale-95">
                <RefreshCcw size={16} /> Try Again
             </Link>
           </div>
        ) : (
          <div className="bg-white rounded-b-3xl p-8 xl:p-14 border-x border-b border-slate-100 shadow-sm relative -top-3 print:top-0 print:border-none print:shadow-none print:p-0">
            {/* Paper Header / Setup */}
            <div className="text-center mb-10 border-b-2 border-slate-900 pb-8 px-4 relative">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight mb-2">{title || "Delhi Public School"}</h2>
              <div className="text-lg font-bold text-slate-700 tracking-wide mb-1 opacity-90">Subject: Generated Assessment</div>
              <div className="text-md font-bold text-slate-600 tracking-wide">Class: Dynamic</div>
              
              <div className="flex justify-between items-end mt-12 font-bold text-slate-800 text-sm md:text-base">
                <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">Time Allowed: <span className="text-slate-900 font-extrabold ml-1">45 minutes</span></div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">Maximum Marks: <span className="text-slate-900 font-extrabold ml-1">{config.totalMarks}</span></div>
              </div>
            </div>

            {/* General Instructions */}
            <div className="mb-10 text-slate-800 font-semibold tracking-wide italic px-2">
              All questions are compulsory unless stated otherwise.
            </div>

            {/* Student Info Lines */}
            <div className="space-y-6 mb-16 pl-2 max-w-sm">
              <div className="flex items-end gap-3 w-full group">
                <span className="font-extrabold text-slate-900 text-[15px] shrink-0 w-28 uppercase tracking-wide">Name:</span>
                <div className="flex-1 border-b-[3px] border-slate-300 group-hover:border-slate-800 transition-colors h-6"></div>
              </div>
              <div className="flex items-end gap-3 w-full group">
                <span className="font-extrabold text-slate-900 text-[15px] shrink-0 w-28 uppercase tracking-wide">Roll Number:</span>
                <div className="flex-1 border-b-[3px] border-slate-300 group-hover:border-slate-800 transition-colors h-6"></div>
              </div>
              <div className="flex items-end gap-3 w-full group">
                <span className="font-extrabold text-slate-900 text-[15px] shrink-0 w-28 uppercase tracking-wide">Class & Section:</span>
                <div className="flex-1 border-b-[3px] border-slate-300 group-hover:border-slate-800 transition-colors h-6"></div>
              </div>
            </div>

            {/* Sections & Questions loop */}
            <div className="space-y-16">
              {paper?.sections.map((section: any, idx: number) => (
                <div key={idx} className="print:break-inside-avoid">
                  {/* Section Title */}
                  <h3 className="text-center text-xl font-bold bg-slate-100 text-slate-900 py-3 px-6 mx-auto inline-block rounded-xl border border-slate-200 mb-6 block drop-shadow-sm w-fit w-full max-w-xs mx-auto mb-8">
                    {section.title}
                  </h3>
                  
                  {/* Section Instruction */}
                  {section.instruction && (
                    <p className="text-sm font-semibold text-slate-500 mb-6 italic pl-2 border-l-4 border-slate-200">
                      {section.instruction}
                    </p>
                  )}

                  {/* Questions List */}
                  <div className="space-y-6 pl-1">
                    {section.questions.map((q: any, qIdx: number) => {
                      const badgeVariant = 
                        q.difficulty === 'Easy' ? 'success' :
                        q.difficulty === 'Moderate' ? 'warning' :
                        q.difficulty === 'Hard' || q.difficulty === 'Challenging' ? 'destructive' : 'default';

                      return (
                        <div key={qIdx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                          <span className="font-extrabold text-lg text-slate-400 min-w-[28px] text-right group-hover:text-slate-900 transition-colors mt-0.5">{qIdx + 1}.</span>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <Badge variant={badgeVariant} className="mt-1 shadow-sm shrink-0 uppercase tracking-widest text-[10px] w-fit">
                                {q.difficulty}
                              </Badge>
                              <p className="text-slate-800 font-medium leading-relaxed grow">{q.text}</p>
                              <span className="font-bold text-slate-400 shrink-0 text-sm whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">[{q.marks} Marks]</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center font-bold text-slate-400 italic text-sm tracking-widest uppercase">
              End of Question Paper
            </div>
          </div>
        )}
      </div>
      
      {/* Global Print Styles to make background invisible and match A4 paper layout perfectly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html, main { background: white !important; height: auto !important; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
          .bg-slate-50, .bg-slate-100 { background: white !important; }
        }
      `}} />
    </div>
  );
}
