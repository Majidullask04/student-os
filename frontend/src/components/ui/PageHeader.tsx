import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  metrics?: { label: string; value: string | number; change?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'indigo',
  icon: Icon,
  actions,
  breadcrumbs,
  metrics,
}) => {
  const badgeClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  }[badgeColor];

  const dotClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  }[badgeColor];

  return (
    <div className="mb-8 animate-slide-up">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-300">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-slate-700 font-semibold' : 'hover:text-slate-600 transition'}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 mt-0.5 btn-tactile">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {badge && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClasses} shadow-2xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClasses} animate-pulse`} />
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {metrics && metrics.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              {metrics.map((m, idx) => (
                <div key={idx} className="px-3 py-1 text-left border-r last:border-r-0 border-slate-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{m.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800 font-mono">{m.value}</span>
                    {m.change && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                        {m.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
