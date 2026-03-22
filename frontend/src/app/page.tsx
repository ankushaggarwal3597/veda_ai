"use client";

import { useEffect, useState } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, MoreVertical, Bell, User, Loader2 } from "lucide-react";
import Link from "next/link";
import socket from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { assignments, isLoading, fetchAssignments, deleteAssignment } = useAssignmentStore();

  useEffect(() => {
    fetchAssignments();
    
    // Ensure socket is listening (it connects on import, but this ensures it's active)
    if (!socket.connected) {
      socket.connect();
    }
  }, [fetchAssignments]);

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full rounded-3xl p-6 md:p-8 xl:p-10 shadow-sm border border-slate-200/60 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
          <span className="text-xl font-medium tracking-tight">←</span>
          <h1 className="text-lg font-semibold tracking-tight text-slate-400">Assignment</h1>
        </div>
        <div className="flex items-center gap-5">
          <button className="relative text-slate-400 hover:text-slate-900 transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
              JD
            </div>
            <span className="text-sm font-semibold text-slate-800">John Doe v</span>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assignments</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1 ml-5">Manage and create assignments for your classes.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors">
          <Filter size={16} /> Filter By
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Assignment" 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm transition-all text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Assignments Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" /> Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="mb-4 font-medium">No assignments found.</p>
          <Link href="/create" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95">
            + Create Assignment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20">
          {assignments.map((assignment) => (
            <div 
              key={assignment._id}
              onClick={() => router.push(`/assignment/${assignment._id}`)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 relative cursor-pointer group block"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors">{assignment.title}</h3>
                <div 
                  className="relative" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === assignment._id ? null : assignment._id); }}
                >
                  <button className="text-slate-400 hover:text-slate-900 mt-1 transition-colors p-1 rounded-md hover:bg-slate-100">
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === assignment._id && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/assignment/${assignment._id}`); }}
                        className="w-full text-left px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 font-semibold"
                      >
                        View Assignment
                      </button>
                      <button 
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          await deleteAssignment(assignment._id); 
                          setOpenMenuId(null); 
                        }} 
                        className="w-full text-left px-5 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {assignment.status !== 'Completed' && (
                  <Badge 
                    variant={assignment.status === 'Generating' ? 'warning' : 'outline'} 
                    className="mb-4"
                  >
                    {assignment.status === 'Generating' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                    {assignment.status}
                  </Badge>
                )}

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-8 pt-4 border-t border-slate-50 w-full">
                  <span>Assigned on: <span className="text-slate-700">{new Date(assignment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-lg">Due: <span className="text-slate-700">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</span></span>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
