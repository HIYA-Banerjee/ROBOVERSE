"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, 
  Sparkles, 
  ArrowLeft, 
  Send,
  BookOpen,
  LineChart,
  Play,
  X
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import WiringStudio from "@/components/dashboard/WiringStudio";
import RobotBuilder from "@/components/dashboard/RobotBuilder";
import SimulationLab from "@/components/dashboard/SimulationLab";
import ProgrammingLab from "@/components/dashboard/ProgrammingLab";
import HardwareGenerator from "@/components/dashboard/HardwareGenerator";
import RLWorkspace from "@/components/dashboard/RLWorkspace";
import { API_BASE_URL } from "@/config";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("learning"); // learning, wiring, builder, simulation, code, hardware, rl
  const [showMobileTutor, setShowMobileTutor] = useState(false);
  
  // --- Wiring Studio State ---
  const [placedComponents, setPlacedComponents] = useState<any[]>([]);
  const [wires, setWires] = useState<any[]>([]);
  const [wireStart, setWireStart] = useState<{ compId: string; pin: string } | null>(null);
  const [validationResult, setValidationResult] = useState<any>({ valid: true, errors: [], warnings: [], info: [] });
  
  // --- Robot Builder State ---
  const [robotChassis, setRobotChassis] = useState("two_wheel");
  const [robotController, setRobotController] = useState("arduino_uno");
  const [robotSensors, setRobotSensors] = useState<string[]>([]);
  const [robotSaved, setRobotSaved] = useState(false);

  // --- Code Editor State ---
  const [editorLanguage, setEditorLanguage] = useState("cpp");
  const [editorCode, setEditorCode] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("RoboVerse terminal initialized. Write code and click 'Compile & Run'.");
  const [codeErrors, setCodeErrors] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  // --- AI Tutor State ---
  const [tutorMessages, setTutorMessages] = useState<any[]>([
    { role: "assistant", content: "Hello! I am your AI Robotics Tutor. Wire a circuit, run a simulation, or ask me any question about robotics concepts!" }
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  // --- Simulation Lab State ---
  const [telemetry, setTelemetry] = useState<any>({
    engine: "RoboSim (Kinematics)",
    x: 0,
    y: 0,
    theta: 0,
    battery: 100,
    sensors: { ultrasonic: 5, lidar: Array(16).fill(8), gps: [0, 0], accelerometer: [0, 0] }
  });
  const [simActive, setSimActive] = useState(false);
  const [simEnv, setSimEnv] = useState("empty");

  // --- Learning Hub State (Synced via localStorage) ---
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  // --- Hardware Generator State ---
  const [generatedHardware, setGeneratedHardware] = useState<any>(null);
  const [fetchingHardware, setFetchingHardware] = useState(false);

  // Sync badges count on mount and active tab changes
  useEffect(() => {
    const savedBadges = localStorage.getItem("roboverse_badges");
    if (savedBadges) {
      try {
        setEarnedBadges(JSON.parse(savedBadges));
      } catch (e) {
        console.error("Failed loading badges:", e);
      }
    }
  }, [activeTab]);

  // --- API Integrations ---
  const triggerCircuitValidation = async (updatedComponents = placedComponents, updatedWires = wires) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components: updatedComponents, wires: updatedWires })
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (e) {
      console.error("Failed validation request:", e);
    }
  };

  const executeCodeDryRun = async () => {
    setIsCompiling(true);
    setTerminalOutput("[RUN] Contacting dry-run execution compiler...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editorCode, language: editorLanguage })
      });
      const data = await res.json();
      setCodeErrors(data.errors);
      setTerminalOutput(data.output);
    } catch (e) {
      setTerminalOutput("[ERROR] Failed to establish communication with compiler API.");
    } finally {
      setIsCompiling(false);
    }
  };

  const getTutorResponse = async () => {
    if (!tutorInput.trim()) return;
    const newUserMsg = { role: "user", content: tutorInput };
    setTutorMessages(prev => [...prev, newUserMsg]);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...tutorMessages, newUserMsg],
          context: { components: placedComponents, wires: wires }
        })
      });
      const data = await res.json();
      setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setTutorMessages(prev => [...prev, { role: "assistant", content: "Error: Could not reach tutor module backend." }]);
    } finally {
      setTutorLoading(false);
    }
  };

  const generateBOMandInstructions = async () => {
    setFetchingHardware(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components: placedComponents, wires: wires })
      });
      const data = await res.json();
      setGeneratedHardware(data);
    } catch (e) {
      console.error("BOM generation error:", e);
    } finally {
      setFetchingHardware(false);
    }
  };

  // Trigger hardware generator compilation when active tab changes
  useEffect(() => {
    if (activeTab === "hardware") {
      generateBOMandInstructions();
    }
  }, [activeTab, placedComponents, wires]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Dashboard Top Header */}
      <header className="glass-panel border-b border-cyan-950 px-4 md:px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="p-2 hover:bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent text-sm md:text-base">
              ROBOVERSE LABS
            </h1>
          </div>
          {/* Mobile Tab Select Dropdown */}
          <select 
            value={activeTab} 
            onChange={(e) => {
              setActiveTab(e.target.value);
              setShowMobileTutor(false); // close tutor when switching tabs
            }}
            className="md:hidden bg-gray-900 border border-cyan-950 text-cyan-400 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono font-bold w-40"
          >
            <option value="learning">Learning Hub</option>
            <option value="wiring">Wiring Studio</option>
            <option value="builder">Robot Builder</option>
            <option value="simulation">Simulation Lab</option>
            <option value="code">Programming Lab</option>
            <option value="hardware">Hardware Generator</option>
            <option value="rl">RL Lab</option>
          </select>
        </div>

        {/* Global Stats indicators */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">BADGES:</span>
            <span className="text-yellow-500 font-bold">{earnedBadges.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">WIRING STATUS:</span>
            <span className={`font-bold ${validationResult.errors.length > 0 ? "text-red-400" : placedComponents.length > 0 ? "text-cyan-400" : "text-gray-500"}`}>
              {validationResult.errors.length > 0 ? "Review Required" : placedComponents.length > 0 ? "Validated" : "No Circuit"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Tutor Toggle Button for Mobile */}
          <button
            onClick={() => setShowMobileTutor(!showMobileTutor)}
            className="lg:hidden p-2 bg-gray-900 hover:bg-cyan-950/30 text-cyan-400 rounded border border-cyan-950 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono">Tutor</span>
          </button>

          <Link href="/testing" className="hidden sm:block px-4 py-2 bg-gray-900 hover:bg-cyan-950/30 text-cyan-400 font-mono text-xs rounded border border-cyan-950 hover:border-cyan-500/50 transition-all">
            /testing diagnostics
          </Link>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Navigation Sidebar (Desktop/Tablet only) */}
        <div className="hidden md:flex shrink-0">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} telemetry={telemetry} />
        </div>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 bg-gray-950 p-4 md:p-6 overflow-y-auto flex flex-col">
          
          {/* TAB 1: LEARNING HUB REDIRECT */}
          {activeTab === "learning" && (
            <div className="space-y-6 max-w-4xl">
              <div className="glass-panel p-8 rounded-2xl border-cyan-950/60 bg-gray-900/20 text-center space-y-6">
                <BookOpen className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Robotics Learning Hub</h2>
                  <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                    Access our dedicated course catalog filled with detailed slides, concepts, interactive quizzes, score rewards, and AI tutor assistance.
                  </p>
                </div>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider glow-cyan transition-all"
                >
                  <Play className="w-4 h-4 fill-black" /> Enter Learning Hub
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: WIRING STUDIO */}
          {activeTab === "wiring" && (
            <WiringStudio
              placedComponents={placedComponents}
              setPlacedComponents={setPlacedComponents}
              wires={wires}
              setWires={setWires}
              wireStart={wireStart}
              setWireStart={setWireStart}
              validationResult={validationResult}
              triggerCircuitValidation={triggerCircuitValidation}
            />
          )}

          {/* TAB 3: ROBOT BUILDER */}
          {activeTab === "builder" && (
            <RobotBuilder
              robotChassis={robotChassis}
              setRobotChassis={setRobotChassis}
              robotController={robotController}
              setRobotController={setRobotController}
              robotSensors={robotSensors}
              setRobotSensors={setRobotSensors}
              robotSaved={robotSaved}
              setRobotSaved={setRobotSaved}
            />
          )}

          {/* TAB 4: SIMULATION LAB */}
          {activeTab === "simulation" && (
            <SimulationLab
              simActive={simActive}
              setSimActive={setSimActive}
              simEnv={simEnv}
              setSimEnv={setSimEnv}
              robotChassis={robotChassis}
              telemetry={telemetry}
              setTelemetry={setTelemetry}
            />
          )}

          {/* TAB 5: PROGRAMMING LAB */}
          {activeTab === "code" && (
            <ProgrammingLab
              editorLanguage={editorLanguage}
              setEditorLanguage={setEditorLanguage}
              editorCode={editorCode}
              setEditorCode={setEditorCode}
              terminalOutput={terminalOutput}
              setTerminalOutput={setTerminalOutput}
              codeErrors={codeErrors}
              isCompiling={isCompiling}
              executeCodeDryRun={executeCodeDryRun}
            />
          )}

          {/* TAB 6: HARDWARE GENERATOR */}
          {activeTab === "hardware" && (
            <HardwareGenerator
              generatedHardware={generatedHardware}
              fetchingHardware={fetchingHardware}
            />
          )}

          {/* TAB 7: RL LAB */}
          {activeTab === "rl" && <RLWorkspace />}
        </main>

        {/* AI Tutor Chat panel (Fixed Right Sidebar / Mobile Drawer) */}
        <aside className={`
          ${showMobileTutor 
            ? "fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-gray-950 border-l border-cyan-500/30 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-250" 
            : "hidden lg:flex w-80 bg-gray-900/60 border-l border-cyan-950/60 flex flex-col shrink-0 z-10"
          }
        `}>
          <div className="p-4 border-b border-cyan-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-white text-sm">AI Robotics Tutor</h3>
            </div>
            {/* Close Button for Mobile Drawer */}
            <button 
              onClick={() => setShowMobileTutor(false)}
              className="lg:hidden p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tutorMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "assistant" 
                    ? "bg-slate-900 border border-cyan-950/60 text-gray-200 self-start" 
                    : "bg-cyan-600 text-black font-semibold self-end ml-auto"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {tutorLoading && (
              <div className="p-3 bg-gray-900/50 text-[10px] text-cyan-500 animate-pulse rounded-lg self-start">
                Tutor brainstorming suggestions...
              </div>
            )}
          </div>

          {/* Quick-Click prompt suggestions */}
          <div className="p-3 border-t border-cyan-950/40 flex flex-wrap gap-1.5 shrink-0 bg-gray-950/30">
            {[
              { label: "Explain common ground", query: "Why do I need a common ground in robotics circuits?" },
              { label: "HC-SR04 pins", query: "Explain HC-SR04 ultrasonic sensor pin mappings" },
              { label: "Motor driver L298N", query: "Why do I need an L298N motor driver instead of direct Arduino pins?" }
            ].map((hint, idx) => (
              <button
                key={idx}
                onClick={() => { setTutorInput(hint.query); }}
                className="text-[9px] px-2 py-1 bg-gray-900 hover:bg-cyan-950/40 hover:text-cyan-400 text-gray-400 rounded transition-all border border-cyan-950/40"
              >
                {hint.label}
              </button>
            ))}
          </div>

          {/* Input field controls */}
          <div className="p-4 border-t border-cyan-950/80 bg-gray-950 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); getTutorResponse(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask tutor something..."
                className="flex-grow bg-gray-900 border border-cyan-950 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
              <button 
                type="submit"
                className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-colors glow-cyan flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>

      </div>
    </div>
  );
}
