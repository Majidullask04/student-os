import React from 'react';
import { GraduationCap, BookOpen, Calendar, Clock, Award, FileText, CheckCircle2 } from 'lucide-react';

export const Academics: React.FC = () => {
  const semesters = [
    { name: 'Semester 5 (Current)', gpa: '8.8 / 10.0', credits: '24 Credits' },
    { name: 'Semester 4', gpa: '8.6 / 10.0', credits: '22 Credits' },
    { name: 'Semester 3', gpa: '8.9 / 10.0', credits: '22 Credits' },
  ];

  const courses = [
    { code: 'CS301', name: 'Database Management Systems', prof: 'Dr. Sharma', progress: 78, attendance: '92%' },
    { code: 'CS302', name: 'Design and Analysis of Algorithms', prof: 'Prof. Rao', progress: 85, attendance: '96%' },
    { code: 'CS303', name: 'Operating Systems & Concurrency', prof: 'Dr. Nair', progress: 65, attendance: '88%' },
    { code: 'CS304', name: 'Machine Learning Foundations', prof: 'Dr. Patel', progress: 90, attendance: '95%' },
  ];

  const exams = [
    { title: 'DBMS Mid-Term Exam', date: 'Oct 04, 2026', room: 'Hall 302', time: '10:00 AM' },
    { title: 'Algorithms Lab Assessment', date: 'Oct 08, 2026', room: 'Lab 4', time: '02:00 PM' },
    { title: 'Operating Systems Project Demo', date: 'Oct 15, 2026', room: 'Lab 1', time: '11:30 AM' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            College & Academics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sync your university curriculum with your self-paced AI engineering roadmap.
          </p>
        </div>
      </div>

      {/* GPA & Semester Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {semesters.map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.name}</span>
            <h3 className="text-xl font-bold text-slate-900">{s.gpa}</h3>
            <p className="text-xs text-indigo-600 font-medium">{s.credits}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Courses + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Current Semester Courses
          </h2>

          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.code} className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {course.code}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">{course.name}</h3>
                    <p className="text-[11px] text-slate-400">{course.prof} • Attendance: {course.attendance}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{course.progress}%</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upcoming Deadlines & Exams</h3>
          </div>

          <div className="space-y-3 text-xs">
            {exams.map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600">{ex.date} • {ex.time}</span>
                <h4 className="font-bold text-slate-800">{ex.title}</h4>
                <p className="text-[11px] text-slate-500">Location: {ex.room}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
