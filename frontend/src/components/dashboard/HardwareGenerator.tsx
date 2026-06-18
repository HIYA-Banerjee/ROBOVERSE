"use client";

import React from "react";
import { Download } from "lucide-react";

interface HardwareGeneratorProps {
  generatedHardware: any;
  fetchingHardware: boolean;
}

export default function HardwareGenerator({
  generatedHardware,
  fetchingHardware
}: HardwareGeneratorProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Real Hardware Generator</h2>
        <p className="text-gray-400 text-sm">Export wiring designs and download microcontroller codes to build your robot physically.</p>
      </div>

      {fetchingHardware ? (
        <div className="p-8 text-center text-gray-500 font-mono animate-pulse">Compiling hardware translation guides...</div>
      ) : generatedHardware ? (
        <div className="space-y-6">
          {/* Cost Summary card */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-950 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-cyan-950/20 to-transparent">
            <div>
              <h4 className="text-xs uppercase text-cyan-400 font-bold tracking-wider">Estimated Project Budget</h4>
              <div className="text-3xl font-extrabold text-white mt-1">
                ${generatedHardware.total_cost.toFixed(2)}
              </div>
            </div>
            
            <div className="flex gap-3">
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(generatedHardware.arduino_code)}`}
                download="robot_control.ino"
                className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-all hover:border-gray-700"
              >
                <Download className="w-4 h-4" /> Download .INO
              </a>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(generatedHardware.raspberry_pi_code)}`}
                download="robot_control.py"
                className="px-4 py-2.5 bg-cyan-500 rounded-lg text-xs font-bold text-black hover:bg-cyan-400 flex items-center gap-2 transition-all glow-cyan"
              >
                <Download className="w-4 h-4" /> Download .PY
              </a>
            </div>
          </div>

          {/* BOM Table */}
          <div className="glass-panel rounded-2xl border-cyan-950 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-900/40 text-xs font-bold uppercase tracking-wider text-cyan-400">
              Bill of Materials (BOM)
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 font-mono">
                    <th className="p-4">Component Name</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Total Cost</th>
                    <th className="p-4">Supplier Link</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedHardware.bom.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-900 hover:bg-gray-900/40">
                      <td className="p-4 font-semibold text-white">{item.name}</td>
                      <td className="p-4 font-mono">{item.qty}</td>
                      <td className="p-4 font-mono">${item.unit_cost.toFixed(2)}</td>
                      <td className="p-4 font-mono text-cyan-400">${item.total_cost.toFixed(2)}</td>
                      <td className="p-4">
                        <a 
                          href={item.purchase_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1.5"
                        >
                          View Item
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wiring & Assembly step blocks */}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Wiring checklist */}
            <div className="glass-panel p-6 rounded-2xl border-cyan-950 space-y-4">
              <h4 className="text-xs uppercase text-cyan-400 font-bold tracking-wider border-b border-gray-800 pb-2">
                Physical Wiring Guide
              </h4>
              <ul className="space-y-3 text-xs text-gray-300">
                {generatedHardware.wiring_checklist.length === 0 ? (
                  <li className="text-gray-500 italic">Create connections in the Wiring Studio to generate guides.</li>
                ) : (
                  generatedHardware.wiring_checklist.map((w: string, idx: number) => (
                    <li key={idx} className="flex gap-3 items-start font-mono">
                      <span className="text-cyan-400 font-bold shrink-0">{idx+1}.</span>
                      <span>{w}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Assembly guide */}
            <div className="glass-panel p-6 rounded-2xl border-cyan-950 space-y-4">
              <h4 className="text-xs uppercase text-cyan-400 font-bold tracking-wider border-b border-gray-800 pb-2">
                Mechanical Assembly Guide
              </h4>
              <ul className="space-y-3 text-xs text-gray-300">
                {generatedHardware.steps.map((step: string, idx: number) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-500/30">
                      {idx+1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
          Add components in the Wiring Studio to compile physical templates.
        </div>
      )}
    </div>
  );
}
