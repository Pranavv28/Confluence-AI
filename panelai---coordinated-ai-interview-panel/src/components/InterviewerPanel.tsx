import React from "react";
import { InterviewerRole } from "../types/interview";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import { Terminal, Target, Users, Briefcase, Building, Volume2, CheckCircle2 } from "lucide-react";

interface InterviewerPanelProps {
  activeRole: InterviewerRole;
  isAgentSpeaking: boolean;
  completedRoles: InterviewerRole[];
  enabledRoles?: InterviewerRole[];
  onSelectRole?: (role: InterviewerRole) => void;
}

export const InterviewerPanel: React.FC<InterviewerPanelProps> = ({
  activeRole,
  isAgentSpeaking,
  completedRoles,
  enabledRoles = ["technical", "product", "behavioral", "hiring_manager"],
  onSelectRole,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "terminal":
        return <Terminal className="h-4 w-4" />;
      case "target":
        return <Target className="h-4 w-4" />;
      case "users":
        return <Users className="h-4 w-4" />;
      case "briefcase":
        return <Briefcase className="h-4 w-4" />;
      case "building":
        return <Building className="h-4 w-4" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
          AI Interview Panel
        </h3>
        <span className="text-[11px] font-mono text-zinc-400">
          {enabledRoles.length} Personas Coordinated
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {enabledRoles.map((roleKey) => {
          const persona = INTERVIEWER_PERSONAS[roleKey];
          const isActive = activeRole === roleKey;
          const isCompleted = completedRoles.includes(roleKey);

          return (
            <div
              key={persona.id}
              onClick={() => onSelectRole && onSelectRole(roleKey)}
              className={`relative overflow-hidden rounded-xl border p-3.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-900/90 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "bg-zinc-950/60 border-zinc-800/70 hover:bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              {/* Active Indicator Strip */}
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: persona.accentColor }}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Persona Avatar */}
                  <div className="relative">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className={`h-11 w-11 rounded-xl object-cover border-2 transition ${
                        isActive ? "border-blue-400 ring-2 ring-blue-400/20" : "border-zinc-700 grayscale-[20%]"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300"
                      title={persona.role}
                    >
                      {getIcon(persona.iconName)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">{persona.name}</span>
                      {isCompleted && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" title="Completed focus module" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-400 line-clamp-1">{persona.title}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-zinc-400">
                      Weight: {persona.weight}%
                    </span>
                  </div>
                </div>

                {/* State Tag */}
                <div>
                  {isActive ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                      {isAgentSpeaking ? (
                        <>
                          <Volume2 className="h-3 w-3 animate-pulse" />
                          <span>SPEAKING</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                          <span>ACTIVE</span>
                        </>
                      )}
                    </div>
                  ) : isCompleted ? (
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md">
                      Evaluated
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-400">Queued</span>
                  )}
                </div>
              </div>

              {/* Persona Focus Snippet */}
              <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="truncate pr-2">{persona.objective}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
