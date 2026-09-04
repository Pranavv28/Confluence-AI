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
        return <Terminal className="h-3.5 w-3.5" />;
      case "target":
        return <Target className="h-3.5 w-3.5" />;
      case "users":
        return <Users className="h-3.5 w-3.5" />;
      case "briefcase":
        return <Briefcase className="h-3.5 w-3.5" />;
      case "building":
        return <Building className="h-3.5 w-3.5" />;
      default:
        return <Terminal className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          Hiring Panel Roster
        </h3>
        <span className="text-[11px] text-stone-400 font-medium">
          {enabledRoles.length} Personas
        </span>
      </div>

      <div className="flex flex-col gap-2">
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
                  ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20"
                  : isCompleted
                  ? "bg-stone-50/80 border-stone-200 hover:bg-white"
                  : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              {/* Left active accent bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
              )}

              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  {/* Persona Headshot Avatar */}
                  <div className="relative">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className={`h-10 w-10 rounded-full object-cover border transition ${
                        isActive ? "border-blue-600 ring-2 ring-blue-100" : "border-stone-200"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-600 shadow-xs"
                      title={persona.role}
                    >
                      {getIcon(persona.iconName)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-stone-900">{persona.name}</span>
                      {isCompleted && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" title="Completed focus module" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1">{persona.title}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isActive ? (
                    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                      {isAgentSpeaking ? (
                        <>
                          <Volume2 className="h-3 w-3 animate-pulse text-blue-600" />
                          <span>Speaking</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span>Active</span>
                        </>
                      )}
                    </div>
                  ) : isCompleted ? (
                    <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      Evaluated
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-stone-400">Upcoming</span>
                  )}
                </div>
              </div>

              {/* Focus Area */}
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate">Focus: {persona.focusAreas[0]}</span>
                <span className="text-stone-400 font-mono text-[10px]">{persona.weight}% weight</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
