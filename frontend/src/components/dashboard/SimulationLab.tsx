"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Square, Play } from "lucide-react";
import { WS_BASE_URL } from "@/config";

const ThreeRobotViewer = dynamic(() => import("@/components/ThreeRobotViewer"), { ssr: false });

interface SimulationLabProps {
  simActive: boolean;
  setSimActive: (active: boolean) => void;
  simEnv: string;
  setSimEnv: (env: string) => void;
  robotChassis: string;
  telemetry: any;
  setTelemetry: React.Dispatch<React.SetStateAction<any>>;
}

export default function SimulationLab({
  simActive,
  setSimActive,
  simEnv,
  setSimEnv,
  robotChassis,
  telemetry,
  setTelemetry
}: SimulationLabProps) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (simActive) {
      // Use config variable for WebSocket URL
      const socket = new WebSocket(`${WS_BASE_URL}/ws/simulation`);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("Simulation WebSocket open");
        // Reset simulation in environment
        socket.send(JSON.stringify({ action: "reset", env: simEnv, robot: robotChassis }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
        } catch (err) {
          console.error("Failed parsing telemetry:", err);
        }
      };

      socket.onclose = () => {
        console.log("Simulation WebSocket closed");
        setSimActive(false);
      };

      socket.onerror = (e) => {
        console.error("Simulation WebSocket error:", e);
        setSimActive(false);
      };

      // Keyboard Controls teleoperation
      const handleKeyDown = (e: KeyboardEvent) => {
        let linear = 0.0;
        let angular = 0.0;
        if (e.key === "w" || e.key === "ArrowUp") linear = 1.5;
        if (e.key === "s" || e.key === "ArrowDown") linear = -1.5;
        if (e.key === "a" || e.key === "ArrowLeft") angular = -1.2;
        if (e.key === "d" || e.key === "ArrowRight") angular = 1.2;

        if (socket.readyState === WebSocket.OPEN && (linear !== 0 || angular !== 0)) {
          socket.send(JSON.stringify({ action: "teleop", linear, angular }));
        }
      };

      const handleKeyUp = () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ action: "teleop", linear: 0.0, angular: 0.0 }));
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        socket.close();
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [simActive, simEnv, robotChassis, setTelemetry, setSimActive]);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Physics Simulation Lab</h2>
          <p className="text-gray-400 text-sm">Teleoperate your virtual robot using WASD / Arrow keys and observe real-time sensor streams.</p>
        </div>

        {/* Env and controls selectors */}
        <div className="flex gap-3 shrink-0">
          <select 
            value={simEnv} 
            onChange={(e) => setSimEnv(e.target.value)}
            className="bg-gray-900 border border-cyan-950/60 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="empty">Empty Arena</option>
            <option value="warehouse">Warehouse Racks</option>
            <option value="hospital">Hospital Corridors</option>
            <option value="factory">Factory Machinery</option>
            <option value="smart_home">Smart Home Layout</option>
          </select>

          <button
            onClick={() => setSimActive(!simActive)}
            className={`px-6 py-2 rounded font-bold text-xs transition-colors flex items-center gap-2 ${
              simActive ? "bg-red-500 text-white hover:bg-red-400" : "bg-cyan-500 text-black hover:bg-cyan-400 glow-cyan"
            }`}
          >
            {simActive ? (
              <>
                <Square className="w-4 h-4" /> Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* 3D Simulation Viewport */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-2xl border-cyan-950 flex flex-col items-center justify-center bg-gray-900/30 min-h-[400px]">
          <div className="text-xs text-gray-500 font-mono mb-2 self-start flex justify-between w-full">
            <span>Engine: Three.js R3F | Environment: {simEnv.toUpperCase()}</span>
            {simActive && <span className="text-red-400 animate-ping font-bold">• LIVE</span>}
          </div>
          
          <ThreeRobotViewer telemetry={telemetry} environment={simEnv} />
          
          <div className="text-[10px] text-gray-500 mt-3 flex justify-between w-full font-mono">
            <span>Use WASD keys to drive robot | Drag to orbit camera</span>
            <span>LIDAR: Purple lines | Ultrasonic: Cyan cone</span>
          </div>
        </div>

        {/* Telemetry Sensor Panels */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-950 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-gray-800 pb-2 mb-4">
              Sensor Streams
            </h3>
            
            <div className="space-y-4">
              {/* Ultrasonic */}
              <div className="p-3 bg-gray-900/60 rounded-xl border border-cyan-950/80">
                <div className="text-xs text-gray-400 font-bold mb-1">Ultrasonic Rangefinder</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-mono">Distance to front obstacle</span>
                  <span className="font-mono text-cyan-400 font-semibold">{telemetry.sensors.ultrasonic.toFixed(2)} m</span>
                </div>
              </div>

              {/* GPS */}
              <div className="p-3 bg-gray-900/60 rounded-xl border border-cyan-950/80">
                <div className="text-xs text-gray-400 font-bold mb-1">GPS Coordinates</div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>LAT: {telemetry.sensors.gps[0].toFixed(4)}</span>
                  <span>LON: {telemetry.sensors.gps[1].toFixed(4)}</span>
                </div>
              </div>

              {/* Accelerometer */}
              <div className="p-3 bg-gray-900/60 rounded-xl border border-cyan-950/80">
                <div className="text-xs text-gray-400 font-bold mb-1">IMU Accelerometer</div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>AX: {telemetry.sensors.accelerometer[0].toFixed(3)} m/s²</span>
                  <span>AY: {telemetry.sensors.accelerometer[1].toFixed(3)} m/s²</span>
                </div>
              </div>
            </div>
          </div>

          {/* Battery Health indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-400">Battery Capacity</span>
              <span className={telemetry.battery < 25 ? "text-red-400" : "text-green-400"}>{telemetry.battery}%</span>
            </div>
            <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
              <div 
                className={`h-full transition-all duration-300 ${telemetry.battery < 25 ? "bg-red-500" : "bg-cyan-500 glow-cyan"}`} 
                style={{ width: `${telemetry.battery}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
