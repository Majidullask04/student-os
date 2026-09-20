import React, { useState } from 'react';
import { Terminal, CheckCircle2, ChevronRight, ChevronDown, Wrench, Clock } from 'lucide-react';

export interface ToolCall {
  id?: string;
  toolName: string;
  args?: Record<string, any>;
  resultSummary?: string;
  resultPayload?: any;
  executionTimeMs?: number;
  status?: 'running' | 'completed' | 'failed';
}

interface ToolCallCardProps {
  tool: ToolCall;
  className?: string;
}

/**
 * Assistant-UI / Linear style Agentic Tool Call Card.
 * Displays real-time agent tool executions, parameters, and payloads
 * with calm, engineering-grade restraint (no rainbow neon glow).
 */
export const ToolCallCard: React.FC<ToolCallCardProps> = ({ tool, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-slate-50/70 text-xs overflow-hidden transition-all ${className}`}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-800 truncate">
            {tool.toolName}
          </span>
          {tool.resultSummary && (
            <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
              — {tool.resultSummary}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tool.executionTimeMs && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {tool.executionTimeMs}ms
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Success</span>
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Parameters & Payload */}
      {isExpanded && (
        <div className="p-3 bg-white border-t border-slate-200/80 space-y-2 text-[11px]">
          {tool.args && Object.keys(tool.args).length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Inputs:
              </span>
              <pre className="p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto leading-tight">
                {JSON.stringify(tool.args, null, 2)}
              </pre>
            </div>
          )}

          {tool.resultPayload && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Output Payload:
              </span>
              <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-tight">
                {typeof tool.resultPayload === 'string' ? tool.resultPayload : JSON.stringify(tool.resultPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
