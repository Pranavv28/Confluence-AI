import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { LandingView } from "./views/LandingView";
import { CandidateDashboardView } from "./views/CandidateDashboardView";
import { ResumeUploadView } from "./views/ResumeUploadView";
import { InterviewSetupView } from "./views/InterviewSetupView";
import { LiveInterviewView } from "./views/LiveInterviewView";
import { AssessmentReportView } from "./views/AssessmentReportView";
import { AdminDashboardView } from "./views/AdminDashboardView";
import { JobManagementView } from "./views/JobManagementView";
import { AiDisclosureModal } from "./components/AiDisclosureModal";
import { DEMO_CANDIDATE, DEMO_JOBS, DEMO_PRECOMPLETED_ASSESSMENT } from "./lib/demoData";
import { CandidateProfile, JobConfig, AssessmentReport } from "./types/interview";

export function App() {
  const [currentView, setCurrentView] = useState<string>("landing");
  const [candidate, setCandidate] = useState<CandidateProfile>(DEMO_CANDIDATE);
  const [selectedJob, setSelectedJob] = useState<JobConfig>(DEMO_JOBS[0]);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentReport>(DEMO_PRECOMPLETED_ASSESSMENT);
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(false);
  const [isDisclosureModalOpen, setIsDisclosureModalOpen] = useState<boolean>(false);

  // Quick Start Flow for Hackathon Judges & Users
  const handleStartDemo = () => {
    setIsDisclosureModalOpen(true);
  };

  const handleAcceptDisclosure = () => {
    setIsDisclosureModalOpen(false);
    setCurrentView("live-interview");
  };

  const handleStartInterviewWithJob = (job: JobConfig) => {
    setSelectedJob(job);
    setIsDisclosureModalOpen(true);
  };

  const handleFinishInterview = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/interview/${sessionId}/assessment`);
      const data = await res.json();
      if (data.assessment) {
        setActiveAssessment(data.assessment);
      }
    } catch (err) {
      console.warn("Could not fetch generated assessment:", err);
    }
    setCurrentView("assessment-report");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E5E5E5] selection:bg-[#FF4D00] selection:text-white font-sans antialiased">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartDemo={handleStartDemo}
        isDebugOpen={isDebugOpen}
        onToggleDebug={() => setIsDebugOpen(!isDebugOpen)}
      />

      {/* Main Content Stage */}
      <main className="transition-opacity duration-300">
        {currentView === "landing" && (
          <LandingView
            onStartDemo={handleStartDemo}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "candidate-dashboard" && (
          <CandidateDashboardView
            candidate={candidate}
            onStartInterview={handleStartInterviewWithJob}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "candidate-resume" && (
          <ResumeUploadView
            candidate={candidate}
            onUpdateCandidate={(p) => setCandidate(p)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "candidate-setup" && (
          <InterviewSetupView
            candidate={candidate}
            selectedJob={selectedJob}
            onSelectJob={(j) => setSelectedJob(j)}
            onProceedToInterview={() => setCurrentView("live-interview")}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "live-interview" && (
          <LiveInterviewView
            candidate={candidate}
            job={selectedJob}
            onFinishInterview={handleFinishInterview}
            isDebugOpen={isDebugOpen}
            onToggleDebug={() => setIsDebugOpen(!isDebugOpen)}
          />
        )}

        {currentView === "assessment-report" && (
          <AssessmentReportView
            assessment={activeAssessment}
            candidate={candidate}
            onBackToDashboard={() => setCurrentView("candidate-dashboard")}
          />
        )}

        {currentView === "admin-dashboard" && (
          <AdminDashboardView
            onViewAssessment={(rep) => {
              setActiveAssessment(rep);
              setCurrentView("assessment-report");
            }}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === "jobs" && (
          <JobManagementView
            onStartInterviewWithJob={handleStartInterviewWithJob}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* AI Disclosure Consent Modal */}
      <AiDisclosureModal
        isOpen={isDisclosureModalOpen}
        onAccept={handleAcceptDisclosure}
        onCancel={() => setIsDisclosureModalOpen(false)}
      />
    </div>
  );
}

export default App;
