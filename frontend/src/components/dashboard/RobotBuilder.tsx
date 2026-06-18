"use client";

import React from "react";

interface RobotBuilderProps {
  robotChassis: string;
  setRobotChassis: (chassis: string) => void;
  robotController: string;
  setRobotController: (controller: string) => void;
  robotSensors: string[];
  setRobotSensors: React.Dispatch<React.SetStateAction<string[]>>;
  robotSaved: boolean;
  setRobotSaved: (saved: boolean) => void;
}

export default function RobotBuilder({
  robotChassis,
  setRobotChassis,
  robotController,
  setRobotController,
  robotSensors,
  setRobotSensors,
  robotSaved,
  setRobotSaved
}: RobotBuilderProps) {
  const toggleSensor = (sensorType: string) => {
    if (robotSensors.includes(sensorType)) {
      setRobotSensors(robotSensors.filter(s => s !== sensorType));
    } else {
      setRobotSensors([...robotSensors, sensorType]);
    }
    setRobotSaved(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Robot Builder Studio</h2>
        <p className="text-gray-400 text-sm">Configure physical attributes of your custom robot before exporting to simulation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Robot Configurations panel */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-950 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-gray-800 pb-2">
            Chassis Attributes
          </h3>
          
          {/* Select Chassis */}
          <div>
            <label className="text-xs text-gray-400 block mb-2 font-semibold">Chassis Geometry</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "two_wheel", label: "2-Wheel Differential" },
                { type: "rover", label: "4-Wheel Rover" },
                { type: "drone", label: "Quad Drone" },
                { type: "robotic_arm", label: "5-DOF Robotic Arm" }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => { setRobotChassis(item.type); setRobotSaved(false); }}
                  className={`p-3 text-center text-xs font-semibold rounded-xl border ${robotChassis === item.type ? "border-cyan-500 bg-cyan-950/20 text-white" : "border-gray-800 bg-gray-950/60 text-gray-400 hover:text-gray-200"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Microcontroller Selection */}
          <div>
            <label className="text-xs text-gray-400 block mb-2 font-semibold">Microcontroller Brain</label>
            <select 
              value={robotController} 
              onChange={(e) => { setRobotController(e.target.value); setRobotSaved(false); }}
              className="w-full bg-gray-950 border border-gray-850 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-xs text-white outline-none"
            >
              <option value="arduino_uno">Arduino Uno R3</option>
              <option value="arduino_nano">Arduino Nano</option>
              <option value="esp32">ESP32 DevKit</option>
              <option value="raspberry_pi">Raspberry Pi 4</option>
            </select>
          </div>

          {/* Add Sensor Attachments */}
          <div>
            <label className="text-xs text-gray-400 block mb-2 font-semibold">Integrated Sensors</label>
            <div className="space-y-2">
              {[
                { type: "ultrasonic", label: "Ultrasonic (Distance avoidance)" },
                { type: "ir", label: "IR Obstacle (Line tracking)" },
                { type: "gps", label: "GPS Tracking (Latitude / Longitude)" },
                { type: "accelerometer", label: "IMU Accelerometer (Gyro tracking)" }
              ].map((sensor) => {
                const active = robotSensors.includes(sensor.type);
                return (
                  <button
                    key={sensor.type}
                    onClick={() => toggleSensor(sensor.type)}
                    className={`w-full p-3 text-left text-xs font-semibold rounded-lg border transition-all flex items-center justify-between ${active ? "border-cyan-500 bg-cyan-950/20 text-white" : "border-gray-850 bg-gray-950/60 text-gray-500"}`}
                  >
                    <span>{sensor.label}</span>
                    <span className={`w-2 h-2 rounded-full ${active ? "bg-cyan-400" : "bg-gray-700"}`}></span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => setRobotSaved(true)}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs tracking-wider rounded-lg transition-colors"
          >
            SAVE DESIGN CONFIG
          </button>
        </div>

        {/* Robot Model Visualization Panel */}
        <div className="glass-panel p-8 rounded-2xl border-cyan-950 flex flex-col justify-between items-center text-center h-[470px]">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-bold block mb-1">
              Visualizer Preview
            </span>
            <h3 className="text-lg font-bold text-white mb-6">RoboVerse Model Mesh</h3>
          </div>

          {/* Graphical representation */}
          <div className="w-56 h-56 rounded-full border border-dashed border-cyan-950/60 flex items-center justify-center relative">
            <div className="absolute inset-4 rounded-full border border-cyan-900/30 animate-spin"></div>
            <div className="w-32 h-32 rounded-lg border border-cyan-500/40 bg-gray-900/80 p-4 flex flex-col justify-around text-xs font-mono glow-cyan/10">
              <div className="text-cyan-400 font-bold uppercase">{robotChassis.replace("_", " ")}</div>
              <div className="text-[10px] text-gray-500 space-y-1 text-left">
                <div>MCU: {robotController.replace("_", " ").toUpperCase()}</div>
                <div>SENSORS: {robotSensors.length}</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-6 max-w-xs">
            {robotSaved ? (
              <span className="text-green-400 font-semibold">
                ✓ Robot design catalog updated. Available in Simulation Lab and Generator exports.
              </span>
            ) : (
              <span>Modify properties and click &apos;Save Design Config&apos; to flash configuration registers.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
