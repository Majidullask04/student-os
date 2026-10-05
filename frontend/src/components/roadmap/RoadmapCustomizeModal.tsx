import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Zap, 
  Clock, 
  Target, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../ui/Toast';

interface RoadmapCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onApplyCustomization: (settings: { pace: string; hoursPerDay: number; focus: string[] }) => void;
}

export const RoadmapCustomizeModal: React.FC<RoadmapCustomizeModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onApplyCustomization,
}) => {
  const { success } = useToast();
  const [selectedPace, setSelectedPace] = useState<'fast-track' | 'deep-mastery' | 'weekend'>('deep-mastery');
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    'production-projects',
    'interview-prep'
  ]);

  if (!isOpen) return null;

  const toggleFocus = (id: string) => {
    if (selectedFocus.includes(id)) {
      setSelectedFocus(selectedFocus.filter(f => f !== id));
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  const handleApply = () => {
    onApplyCustomization({
      pace: selectedPace,
      hoursPerDay,
      focus: selectedFocus
    });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    success('Sprint Adapted!', `Roadmap tuned for ${selectedPace} at ${hoursPerDay} hours/day.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customize Learning Pace & Sprint
              </h3>
              <p className="text-xs text-slate-500">
                Adapt the {currentRole} path to your daily bandwidth.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Learning Pace Track */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Target Velocity & Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'fast-track',
                title: 'Fast-Track',
                subtitle: '4-6 weeks',
                desc: 'Core essentials & must-know interview topics only.',
                icon: Zap
              },
              {
                id: 'deep-mastery',
                title: 'Deep Mastery',
                subtitle: '10-14 weeks',
                desc: 'Senior mental models, trade-offs, and systems.',
                icon: BrainCircuit
              },
              {
                id: 'weekend',
                title: 'Part-Time',
                subtitle: 'Flexible',
                desc: 'Consistent self-paced learning without burnout.',
                icon: Calendar
              }
            ].map(pace => {
              const Icon = pace.icon;
              const isSelected = selectedPace === pace.id;
              return (
                <div
                  key={pace.id}
                  onClick={() => setSelectedPace(pace.id as any)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-mono text-slate-500">{pace.subtitle}</span>
                    </div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {pace.title}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      {pace.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Daily Hours Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Daily Study Bandwidth</span>
            <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              {hoursPerDay} hours / day
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 hr (Light)</span>
            <span>2.5 hrs (Balanced)</span>
            <span>6 hrs (Intensive)</span>
          </div>
        </div>

        {/* 3. Priority Focus Areas */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Priority Emphasis
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'production-projects', label: 'Portfolio Challenges' },
              { id: 'interview-prep', label: 'Interview Traps & Gotchas' },
              { id: 'system-design', label: 'Architecture & Scalability' },
              { id: 'foundations', label: 'CS & Math Fundamentals' }
            ].map(focus => {
              const active = selectedFocus.includes(focus.id);
              return (
                <button
                  key={focus.id}
                  type="button"
                  onClick={() => toggleFocus(focus.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    active 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{focus.label}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm btn-tactile cursor-pointer"
          >
            Apply & Recalibrate
          </button>
        </div>
      </div>
    </div>
  );
};
