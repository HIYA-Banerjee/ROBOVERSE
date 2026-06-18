"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, 
  Play, 
  Square, 
  LineChart, 
  Activity, 
  Cpu, 
  Award,
  HelpCircle
} from "lucide-react";

import { API_BASE_URL, WS_BASE_URL } from "@/config";

const RLChart = dynamic(() => import("@/components/RLChart"), { ssr: false });

export default function RLLabPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentReward, setCurrentReward] = useState(0.0);
  const [episodes, setEpisodes] = useState(0);
  const [envName, setEnvName] = useState("empty");
  const [algorithm, setAlgorithm] = useState("ppo");
  const [metrics, setMetrics] = useState<any[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket to read RL telemetry & progress
  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE_URL}/ws/rl`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("RL WebSocket connected.");
    };

    socket.onmessage = (event) => {
      try {
        const status = JSON.parse(event.data);
        setIsTraining(status.is_training);
        setCurrentStep(status.current_step);
        setCurrentReward(status.current_reward);
        setEpisodes(status.episodes);
        setEnvName(status.env_name);
        setAlgorithm(status.algorithm);
        
        if (status.metrics && status.metrics.length > 0) {
          setMetrics(status.metrics);
        }
      } catch (err) {
        console.error("Failed to parse RL status message:", err);
      }
    };

    socket.onclose = () => {
      console.log("RL WebSocket disconnected.");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleStartTraining = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rl/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ env: envName, algorithm }),
      });
      if (res.ok) {
        setIsTraining(true);
        setMetrics([]);
        setCurrentStep(0);
        setCurrentReward(-100.0);
        setEpisodes(0);
      } else {
        const err = await res.json();
        alert(`Failed to start training: ${err.detail}`);
      }
    } catch (e) {
      console.error("Error starting RL:", e);
    }
  };

  const handleStopTraining = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rl/stop`, {
        method: "POST",
      });
      if (res.ok) {
        setIsTraining(false);
      }
    } catch (e) {
      console.error("Error stopping RL:", e);
    }
  };

  // Extract x and y coordinates for Plotly
  const xData = metrics.map((m) => m.step);
  const yData = metrics.map((m) => m.reward);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans select-none">
      {/* Header */}
      <header className="h-16 border-b border-cyan-950/60 bg-gray-950/80 px-8 flex items-center justify-between shrink-0 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 bg-slate-900 border border-cyan-950/80 hover:border-cyan-500/40 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              ROBOVERSE RL LAB
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping"></div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Agent Core V1</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
          <div className="glass-panel p-6 rounded-2xl border-cyan-950/80 space-y-6 bg-gray-900/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" /> Training Dashboard
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Train a high-fidelity differential drive navigation policy using Proximal Policy Optimization.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Simulation Environment</label>
                <select 
                  value={envName} 
                  disabled={isTraining}
                  onChange={(e) => setEnvName(e.target.value)}
                  className="w-full bg-gray-950 border border-cyan-950/60 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/80 transition-all font-semibold"
                >
                  <option value="empty">Empty Arena (Simple)</option>
                  <option value="warehouse">Logistics Warehouse (Medium)</option>
                  <option value="hospital">Hospital Corridors (Hard)</option>
                  <option value="factory">Factory Floors (Hard)</option>
                  <option value="smart_home">Smart Home Layout (Expert)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">RL Algorithm</label>
                <select 
                  value={algorithm} 
                  disabled={isTraining}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full bg-gray-950 border border-cyan-950/60 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/80 transition-all font-semibold"
                >
                  <option value="ppo">PPO (Proximal Policy Optimization)</option>
                  <option value="dqn" disabled>DQN (Deep Q-Network - Coming Soon)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2 font-bold uppercase tracking-wider">Default Reward Matrix</label>
                <div className="space-y-2 p-4 bg-gray-950/60 rounded-xl border border-cyan-950/40 text-[10px] text-gray-400 font-mono">
                  <div className="flex justify-between">
                    <span>Target Proximity:</span><span className="text-cyan-400 font-semibold">+Relative Dist</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collision Penalty:</span><span className="text-red-400 font-semibold">-2.0 per tick</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Step Cost:</span><span className="text-gray-500 font-semibold">-0.02 per tick</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Reached:</span><span className="text-green-400 font-semibold">+50.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-950/80 space-y-4 bg-gray-900/10">
            {isTraining ? (
              <button
                onClick={handleStopTraining}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                <Square className="w-4 h-4 fill-white" /> Stop Agent Training
              </button>
            ) : (
              <button
                onClick={handleStartTraining}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider glow-cyan transition-all"
              >
                <Play className="w-4 h-4 fill-black" /> Run Policy Optimization
              </button>
            )}
          </div>
        </div>

        {/* Right Status Panel & Plotly Chart */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Status Metrics Banner */}
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-2xl border-cyan-950/80 bg-gray-900/10 flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Steps Elapsed
              </span>
              <span className="text-2xl font-black text-white font-mono mt-2 block">{currentStep}</span>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border-cyan-950/80 bg-gray-900/10 flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Mean Reward
              </span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-2 block">
                {currentStep > 0 ? currentReward.toFixed(1) : "N/A"}
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-cyan-950/80 bg-gray-900/10 flex flex-col justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> Episodes Run
              </span>
              <span className="text-2xl font-black text-white font-mono mt-2 block">{episodes}</span>
            </div>
          </div>

          {/* Plotly Reward Graph */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-950/80 flex-grow flex flex-col justify-between bg-gray-900/10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 border-b border-cyan-950/40 pb-2 mb-4">
                Policy Convergence (Mean Reward curve)
              </h3>
            </div>

            <div className="flex-grow flex items-center justify-center relative min-h-[300px]">
              {metrics.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-gray-500 text-center p-8 bg-gray-950/25 rounded-xl border border-cyan-950/20">
                  <LineChart className="w-10 h-10 text-cyan-500/20 animate-pulse" />
                  <p>Click 'Run Policy Optimization' to generate real-time policy metric streams.</p>
                </div>
              ) : (
                <RLChart xData={xData} yData={yData} />
              )}
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-3">
              <span>Streams update via WebSocket at 20Hz</span>
              <span>Optimizer Model: MLPAgentNetwork</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
