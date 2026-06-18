"use client";

import React, { useRef } from "react";
import { Cpu, Workflow, Zap, HelpCircle, AlertTriangle } from "lucide-react";

// Available components for the Wiring Studio
const COMPONENT_TYPES = [
  { type: "arduino_uno", name: "Arduino Uno", category: "Controller", icon: Cpu, pins: ["5V", "3.3V", "GND", "A0", "A1", "D2", "D3", "D5", "D6", "D9", "D10", "D11", "D12", "D13"] },
  { type: "arduino_nano", name: "Arduino Nano", category: "Controller", icon: Cpu, pins: ["5V", "3.3V", "GND", "A0", "A1", "D2", "D3", "D5", "D6", "D9", "D10", "D11"] },
  { type: "esp32", name: "ESP32 DevKit", category: "Controller", icon: Cpu, pins: ["3V3", "5V", "GND", "GPIO2", "GPIO4", "GPIO5", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO25"] },
  { type: "raspberry_pi", name: "Raspberry Pi 4", category: "Controller", icon: Cpu, pins: ["5V", "3.3V", "GND", "GPIO2", "GPIO3", "GPIO4", "GPIO17", "GPIO27", "GPIO22", "GPIO10"] },
  { type: "ultrasonic", name: "Ultrasonic (HC-SR04)", category: "Sensor", icon: HelpCircle, pins: ["VCC", "TRIG", "ECHO", "GND"] },
  { type: "ir", name: "IR Obstacle Sensor", category: "Sensor", icon: HelpCircle, pins: ["VCC", "GND", "OUT"] },
  { type: "ldr", name: "LDR Light Sensor", category: "Sensor", icon: HelpCircle, pins: ["VCC", "GND", "AO", "DO"] },
  { type: "temperature", name: "DHT11 Temp Sensor", category: "Sensor", icon: HelpCircle, pins: ["VCC", "GND", "DATA"] },
  { type: "servo", name: "SG90 Servo Motor", category: "Actuator", icon: Workflow, pins: ["PWM", "VCC", "GND"] },
  { type: "dc_motor", name: "DC Motor (Yellow Gear)", category: "Actuator", icon: Workflow, pins: ["MOTOR+", "MOTOR-"] },
  { type: "motor_driver", name: "L298N Motor Driver", category: "Driver", icon: Workflow, pins: ["12V", "5V", "GND", "OUT1", "OUT2", "IN1", "IN2", "ENA"] },
  { type: "battery", name: "9V Battery", category: "Power", icon: Zap, pins: ["V+", "V-"] }
];

interface WiringStudioProps {
  placedComponents: any[];
  setPlacedComponents: React.Dispatch<React.SetStateAction<any[]>>;
  wires: any[];
  setWires: React.Dispatch<React.SetStateAction<any[]>>;
  wireStart: { compId: string; pin: string } | null;
  setWireStart: React.Dispatch<React.SetStateAction<{ compId: string; pin: string } | null>>;
  validationResult: any;
  triggerCircuitValidation: (comp?: any[], wires?: any[]) => Promise<void>;
}

export default function WiringStudio({
  placedComponents,
  setPlacedComponents,
  wires,
  setWires,
  wireStart,
  setWireStart,
  validationResult,
  triggerCircuitValidation
}: WiringStudioProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; compX: number; compY: number } | null>(null);

  const addComponentToCanvas = (type: string) => {
    const spec = COMPONENT_TYPES.find(c => c.type === type);
    if (!spec) return;

    const newComp = {
      id: `${type}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      name: spec.name,
      pins: spec.pins,
      x: 100 + Math.random() * 100,
      y: 80 + Math.random() * 100
    };
    
    const updated = [...placedComponents, newComp];
    setPlacedComponents(updated);
    triggerCircuitValidation(updated, wires);
  };

  const removeComponent = (id: string) => {
    const updatedComp = placedComponents.filter(c => c.id !== id);
    const updatedWires = wires.filter(w => w.from !== id && w.to !== id);
    setPlacedComponents(updatedComp);
    setWires(updatedWires);
    triggerCircuitValidation(updatedComp, updatedWires);
  };

  const selectPinForWire = (compId: string, pin: string) => {
    if (!wireStart) {
      setWireStart({ compId, pin });
    } else {
      // Connect components
      if (wireStart.compId !== compId) {
        // Prevent duplicate wires between same pins
        const exists = wires.some(w => 
          (w.from === wireStart.compId && w.fromPin === wireStart.pin && w.to === compId && w.toPin === pin) ||
          (w.from === compId && w.fromPin === pin && w.to === wireStart.compId && w.toPin === wireStart.pin)
        );

        if (!exists) {
          const newWire = {
            id: `w_${Math.random().toString(36).substring(2, 7)}`,
            from: wireStart.compId,
            fromPin: wireStart.pin,
            to: compId,
            toPin: pin,
            color: getWireColor(wireStart.pin, pin)
          };
          const updated = [...wires, newWire];
          setWires(updated);
          triggerCircuitValidation(placedComponents, updated);
        }
      }
      setWireStart(null);
    }
  };

  const getWireColor = (pin1: string, pin2: string) => {
    const isPower = (p: string) => p === "5V" || p === "3.3V" || p === "3V3" || p === "VCC" || p === "V+";
    const isGnd = (p: string) => p === "GND" || p === "V-";
    if (isPower(pin1) || isPower(pin2)) return "#ef4444"; // Red
    if (isGnd(pin1) || isGnd(pin2)) return "#3b82f6"; // Blue (GND)
    return "#eab308"; // Signal (Yellow)
  };

  const clearWiringStudio = () => {
    setPlacedComponents([]);
    setWires([]);
    triggerCircuitValidation([], []);
  };

  // Node Drag Handlers for dynamic positioning
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    // Only drag if clicking the header card
    const target = e.target as HTMLElement;
    if (target.closest(".drag-header")) {
      const comp = placedComponents.find(c => c.id === id);
      if (comp) {
        draggingRef.current = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          compX: comp.x,
          compY: comp.y
        };
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const { id, startX, startY, compX, compY } = draggingRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setPlacedComponents(prev => prev.map(c => {
      if (c.id === id) {
        // Bounds limit within canvas roughly
        const newX = Math.max(10, Math.min(800, compX + dx));
        const newY = Math.max(10, Math.min(600, compY + dy));
        return { ...c, x: newX, y: newY };
      }
      return c;
    }));
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  return (
    <div className="flex-1 flex flex-col gap-6" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Virtual Wiring Studio</h2>
          <p className="text-gray-400 text-sm">Drag or click components to place. Connect pins to complete the circuit. Drag cards by their headers to rearrange.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={clearWiringStudio}
            className="px-4 py-2 border border-gray-800 hover:bg-gray-800 text-xs font-semibold rounded-lg text-gray-300 transition-all"
          >
            Clear Studio
          </button>
          <button 
            onClick={() => triggerCircuitValidation()}
            className="px-5 py-2 bg-cyan-500 text-black text-xs font-bold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Validate Circuit
          </button>
        </div>
      </div>

      {/* Wiring Studio Canvas layout */}
      <div className="flex-grow grid lg:grid-cols-4 gap-6 items-stretch min-h-[500px]">
        
        {/* Component Sidebar Pallet */}
        <div className="glass-panel p-4 rounded-2xl border-cyan-950 space-y-4 max-h-[600px] overflow-y-auto">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold block">
            Component Catalog
          </span>
          
          <div className="space-y-2">
            {COMPONENT_TYPES.map((comp) => {
              const CompIcon = comp.icon;
              return (
                <button
                  key={comp.type}
                  onClick={() => addComponentToCanvas(comp.type)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/50 hover:bg-cyan-950/20 border border-gray-800 hover:border-cyan-500/40 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CompIcon className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">{comp.name}</div>
                      <div className="text-[9px] text-gray-500">{comp.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">+{comp.pins.length} pins</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wire Canvas Area */}
        <div 
          ref={canvasRef}
          className="lg:col-span-3 glass-panel rounded-2xl border-cyan-950/60 bg-gray-900/20 relative overflow-hidden flex flex-col justify-between p-6 min-h-[550px]"
        >
          {/* Canvas Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

          <div className="relative w-full flex-grow min-h-[380px]">
            {placedComponents.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 pointer-events-none">
                <Cpu className="w-12 h-12 text-cyan-500/30 animate-pulse" />
                <p className="text-gray-500 text-sm">Select components from the catalog to place on grid.</p>
              </div>
            ) : (
              placedComponents.map((c) => (
                <div
                  key={c.id}
                  onMouseDown={(e) => handleMouseDown(e, c.id)}
                  className="absolute w-48 rounded-xl border border-cyan-950 bg-slate-900/90 p-4 shadow-xl z-10 select-none"
                  style={{ left: `${c.x}px`, top: `${c.y}px` }}
                >
                  <div className="drag-header flex justify-between items-center border-b border-gray-800 pb-2 mb-3 cursor-move">
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{c.name}</span>
                    <button 
                      onClick={() => removeComponent(c.id)}
                      className="text-[9px] text-red-500 hover:text-red-400 font-mono font-bold bg-red-950/20 px-1.5 py-0.5 rounded"
                    >
                      Del
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    {c.pins.map((pin: string) => (
                      <button
                        key={pin}
                        onClick={() => selectPinForWire(c.id, pin)}
                        className={`p-1 text-[9px] font-mono rounded text-center transition-all ${
                          wireStart?.compId === c.id && wireStart?.pin === pin
                            ? "bg-pink-600 text-white animate-pulse"
                            : "bg-gray-800 text-cyan-400 hover:bg-cyan-950/40 border border-cyan-950/60"
                        }`}
                      >
                        {pin}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* SVG connection lines overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {wires.map((w) => {
                const fromComp = placedComponents.find(c => c.id === w.from);
                const toComp = placedComponents.find(c => c.id === w.to);
                if (!fromComp || !toComp) return null;

                // Calculate visual wire endpoints (center coordinates)
                const x1 = fromComp.x + 96;
                const y1 = fromComp.y + 60;
                const x2 = toComp.x + 96;
                const y2 = toComp.y + 60;

                return (
                  <g key={w.id}>
                    <line 
                      x1={x1} y1={y1} x2={x2} y2={y2} 
                      stroke={w.color} strokeWidth="5" 
                      opacity="0.15" strokeLinecap="round" 
                    />
                    <line 
                      x1={x1} y1={y1} x2={x2} y2={y2} 
                      stroke={w.color} strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="4" fill={w.color} />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Validator alerts bottom bar */}
          <div className="border-t border-cyan-950/80 pt-4 z-10">
            <h4 className="text-xs uppercase text-cyan-400 font-bold tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Live Circuit Validator Diagnostics
            </h4>
            
            {validationResult.errors.length === 0 && validationResult.warnings.length === 0 ? (
              <div className="text-xs text-gray-500">
                {placedComponents.length === 0 
                  ? "Empty canvas. Place components to trigger validator." 
                  : "✅ Circuit connections look clean. Power levels and logic signals are fully compatible."
                }
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {validationResult.errors.map((e: any, idx: number) => (
                  <div key={idx} className="p-2 bg-red-950/30 border border-red-500/40 rounded text-[11px] text-red-400 flex gap-2">
                    <span className="font-bold">❌ Error:</span> {e.message}
                  </div>
                ))}
                {validationResult.warnings.map((w: any, idx: number) => (
                  <div key={idx} className="p-2 bg-yellow-950/30 border border-yellow-500/40 rounded text-[11px] text-yellow-400 flex gap-2">
                    <span className="font-bold">⚠ Warning:</span> {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
