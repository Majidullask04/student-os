import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  FileText, 
  School,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { AcademicCourse, AcademicExam } from '../types';
import confetti from 'canvas-confetti';
import { SpotlightCard } from '../components/ui/SpotlightCard';

export const Academics: React.FC = () => {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [exams, setExams] = useState<AcademicExam[]>([]);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    professor: '',
    credits: 3,
    progress: 75,
    attendance: '95%',
    semester: 'Current Semester'
  });

  const [examForm, setExamForm] = useState({
    title: '',
    courseCode: '',
    date: '',
    time: '10:00 AM',
    room: 'Hall 101'
  });

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    const data = await api.getAcademics();
    setCourses(data.courses || []);
    setExams(data.exams || []);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim()) return;

    await api.saveAcademicCourse({
      code: courseForm.code.trim().toUpperCase(),
      name: courseForm.name.trim(),
      professor: courseForm.professor.trim() || undefined,
      credits: Number(courseForm.credits) || 3,
      progress: Number(courseForm.progress) || 0,
      attendance: courseForm.attendance.trim() || '100%',
      semester: courseForm.semester.trim() || 'Current Semester'
    });

    await loadAcademics();
    setIsAddCourseOpen(false);
    setCourseForm({
      code: '',
      name: '',
      professor: '',
      credits: 3,
      progress: 75,
      attendance: '95%',
      semester: 'Current Semester'
    });
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeleteCourse = async (id: string) => {
    await api.deleteAcademicCourse(id);
    await loadAcademics();
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title.trim()) return;

    await api.saveAcademicExam({
      title: examForm.title.trim(),
      courseCode: examForm.courseCode.trim().toUpperCase() || undefined,
      date: examForm.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: examForm.time || '10:00 AM',
      room: examForm.room || 'Room 1'
    });

    await loadAcademics();
    setIsAddExamOpen(false);
    setExamForm({
      title: '',
      courseCode: '',
      date: '',
      time: '10:00 AM',
      room: 'Hall 101'
    });
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
  };

  const handleDeleteExam = async (id: string) => {
    await api.deleteAcademicExam(id);
    await loadAcademics();
  };

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const avgProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs ring-1 ring-slate-800">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              University Curriculum & Academics
            </h1>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              student • verified
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage your real university coursework, credits, syllabus milestones, and exam schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddExamOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add Exam / Deadline</span>
          </button>
          <button
            onClick={() => setIsAddCourseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* GPA & Semester Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Enrolled Courses</span>
          <h3 className="text-xl font-bold text-slate-900 font-mono">{courses.length} Active</h3>
          <p className="text-xs text-slate-500 font-medium">
            {courses.length > 0 ? `${totalCredits} total credits registered` : 'No courses registered yet'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Curriculum Completion</span>
          <h3 className="text-xl font-bold text-indigo-600 font-mono">{avgProgress}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Upcoming Milestones</span>
          <h3 className="text-xl font-bold text-emerald-600 font-mono">{exams.length}</h3>
          <p className="text-xs text-slate-500 font-medium">
            {exams.length > 0 ? 'Exam and project demo deadlines' : 'No upcoming exams scheduled'}
          </p>
        </div>
      </div>

      {/* Main Grid: Courses + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Current Semester Courses */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Courses ({courses.length})
            </h2>
            {courses.length > 0 && (
              <button 
                onClick={() => setIsAddCourseOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Another
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No University Courses Logged</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Add your current college courses to track syllabus completion alongside your self-paced AI engineering roadmap.
              </p>
              <button
                onClick={() => setIsAddCourseOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Course</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition space-y-2.5 bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono border border-indigo-100">
                          {course.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">{course.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">({course.credits} cr)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {course.professor ? `Prof: ${course.professor}` : 'University Curriculum'} • Attendance: {course.attendance || '100%'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 font-mono">{course.progress}%</span>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Remove Course"
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all" 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (4 cols): Upcoming Exams & Deadlines */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Exam & Deadlines</h3>
            </div>
            {exams.length > 0 && (
              <button 
                onClick={() => setIsAddExamOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>

          {exams.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
              <Calendar className="w-5 h-5 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">No Upcoming Deadlines</h4>
              <p className="text-[11px] text-slate-400">
                Log your mid-terms, final exams, or lab submissions.
              </p>
              <button
                onClick={() => setIsAddExamOpen(true)}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Deadline</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {exams.map((ex) => (
                <div key={ex.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 font-mono">
                      {ex.date} • {ex.time}
                    </span>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      title="Remove Exam"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800">{ex.title}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Location: {ex.room || 'Campus Hall'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add University Course</h3>
                  <p className="text-xs text-slate-500">Record a course from your university curriculum.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCourseOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Systems"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instructor / Professor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Doe"
                  value={courseForm.professor}
                  onChange={(e) => setCourseForm({ ...courseForm, professor: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={courseForm.progress}
                    onChange={(e) => setCourseForm({ ...courseForm, progress: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Attendance</label>
                  <input
                    type="text"
                    value={courseForm.attendance}
                    onChange={(e) => setCourseForm({ ...courseForm, attendance: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Exam / Deadline</h3>
                  <p className="text-xs text-slate-500">Track an upcoming academic exam or submission.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExamOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Mid-Term Exam"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={examForm.courseCode}
                    onChange={(e) => setExamForm({ ...examForm, courseCode: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Location / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 204"
                    value={examForm.room}
                    onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={examForm.time}
                    onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
