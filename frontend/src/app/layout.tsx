import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VedaAI | Assessment Creator",
  description: "Create and manage AI-generated assessments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden`}>
        {/* Sidebar Navigation Mockup */}
        <aside className="w-64 bg-white hidden md:flex flex-col m-4 rounded-3xl shadow-sm p-5 pb-8 relative z-10 box-border border border-slate-100">
          <div className="flex items-center gap-3 mb-10 px-1 mt-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-orange-600 shadow-md shadow-orange-600/20">
              V
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">VedaAI</span>
          </div>
          
          <div className="mb-8">
            <a href="/create" className="flex items-center justify-center w-full gap-2 bg-slate-900 text-white rounded-full py-3 px-4 font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 duration-200">
              <span className="text-xl leading-none -mt-1">+</span> Create Assignment
            </a>
          </div>

          <nav className="flex-1 space-y-2">
            <a href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
              Home
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
              My Groups
            </a>
            <a href="/" className="flex items-center gap-3 px-3 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-semibold transition-all shadow-sm text-sm">
              Assignments 
              <span className="ml-auto bg-orange-500 text-white text-xs py-0.5 px-2.5 rounded-full font-bold shadow-sm shadow-orange-500/20">10</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
              AI Teacher's Toolkit
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
              My Library
            </a>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-100/80">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-xl shadow-sm">👨‍🏫</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">Delhi Public School</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]">Bokaro Steel City</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto px-4 md:px-8 py-6 w-full max-w-[1100px] mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
