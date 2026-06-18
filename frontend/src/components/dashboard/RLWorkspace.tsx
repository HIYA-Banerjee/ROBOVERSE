"use client";

import React from "react";
import Link from "next/link";
import { LineChart, Play } from "lucide-react";

export default function RLWorkspace() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-8 rounded-2xl border-cyan-950/60 bg-gray-900/20 text-center space-y-6">
        <LineChart className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Interactive RL Lab Workspace</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            We have moved the Reinforcement Learning Lab to a dedicated fullscreen workspace with a live 20Hz WebSocket connection and interactive Plotly reward vectors!
          </p>
        </div>
        <Link
          href="/rl-lab"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider glow-cyan transition-all"
        >
          <Play className="w-4 h-4 fill-black" /> Enter Fullscreen RL Lab
        </Link>
      </div>
    </div>
  );
}
