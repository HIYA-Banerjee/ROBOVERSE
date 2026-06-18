"use client";

import React from "react";
import { 
  Cpu, 
  Workflow, 
  Terminal, 
  Zap, 
  BookOpen, 
  Hammer, 
  LineChart 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  telemetry: any;
}

export default function Sidebar({ activeTab, setActiveTab, telemetry }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900/60 border-r border-cyan-950/60 p-4 space-y-2 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold mb-4 px-3">
          Ecosystem Workspace
        </div>
        
        <button 
          onClick={() => setActiveTab("learning")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "learning" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          Learning Hub
        </button>

        <button 
          onClick={() => setActiveTab("wiring")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "wiring" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <Cpu className="w-5 h-5 shrink-0" />
          Wiring Studio
        </button>

        <button 
          onClick={() => setActiveTab("builder")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "builder" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <Hammer className="w-5 h-5 shrink-0" />
          Robot Builder
        </button>

        <button 
          onClick={() => setActiveTab("simulation")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "simulation" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <Workflow className="w-5 h-5 shrink-0" />
          Simulation Lab
        </button>

        <button 
          onClick={() => setActiveTab("code")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "code" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <Terminal className="w-5 h-5 shrink-0" />
          Programming Lab
        </button>

        <button 
          onClick={() => setActiveTab("hardware")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "hardware" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <Zap className="w-5 h-5 shrink-0" />
          Hardware Generator
        </button>

        <button 
          onClick={() => setActiveTab("rl")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === "rl" ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 glow-cyan/10" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}
        >
          <LineChart className="w-5 h-5 shrink-0" />
          RL Lab
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border-cyan-950 space-y-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">Simulator Output</div>
        <div className="space-y-1.5 font-mono text-[10px] text-gray-400">
          <div className="flex justify-between">
            <span>POS_X:</span><span className="text-cyan-400 font-semibold">{telemetry.x.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>POS_Y:</span><span className="text-cyan-400 font-semibold">{telemetry.y.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>BATTERY:</span><span className={`${telemetry.battery < 25 ? "text-red-400" : "text-green-400"} font-semibold`}>{telemetry.battery}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
