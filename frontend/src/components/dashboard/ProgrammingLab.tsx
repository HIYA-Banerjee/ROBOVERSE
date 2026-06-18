"use client";

import React, { useEffect } from "react";
import { Terminal, Play } from "lucide-react";

interface ProgrammingLabProps {
  editorLanguage: string;
  setEditorLanguage: (lang: string) => void;
  editorCode: string;
  setEditorCode: (code: string) => void;
  terminalOutput: string;
  setTerminalOutput: (out: string) => void;
  codeErrors: string[];
  isCompiling: boolean;
  executeCodeDryRun: () => Promise<void>;
}

export default function ProgrammingLab({
  editorLanguage,
  setEditorLanguage,
  editorCode,
  setEditorCode,
  terminalOutput,
  setTerminalOutput,
  codeErrors,
  isCompiling,
  executeCodeDryRun
}: ProgrammingLabProps) {
  
  // Default Code Templates
  useEffect(() => {
    if (editorLanguage === "cpp") {
      setEditorCode(`// Arduino Obstacle Avoidance Template
#include <Servo.h>

#define TRIG_PIN 2
#define ECHO_PIN 3
#define MOTOR_ENA 5
#define MOTOR_IN1 6
#define MOTOR_IN2 7

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTOR_ENA, OUTPUT);
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
}

void loop() {
  // Read sensor and drive motors
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = duration * 0.0343 / 2;
  
  if (distance < 20 && distance > 0) {
    // Obstacle detected, stop
    analogWrite(MOTOR_ENA, 0);
  } else {
    // Go forward
    analogWrite(MOTOR_ENA, 150);
    digitalWrite(MOTOR_IN1, HIGH);
    digitalWrite(MOTOR_IN2, LOW);
  }
  delay(100);
}`);
    } else {
      setEditorCode(`# Raspberry Pi Obstacle Avoidance Template
import RPi.GPIO as GPIO
import time

TRIG_PIN = 23
ECHO_PIN = 24
MOTOR_ENA = 12
MOTOR_IN1 = 17
MOTOR_IN2 = 27

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)
GPIO.setup(MOTOR_ENA, GPIO.OUT)

print("RPi Rover Active!")

try:
    while True:
        GPIO.output(TRIG_PIN, True)
        time.sleep(0.00001)
        GPIO.output(TRIG_PIN, False)
        
        while GPIO.input(ECHO_PIN) == 0:
            pulse_start = time.time()
        while GPIO.input(ECHO_PIN) == 1:
            pulse_end = time.time()
            
        distance = (pulse_end - pulse_start) * 34300 / 2
        print(f"Distance: {distance:.1f} cm")
        
        if distance < 20.0:
            GPIO.output(MOTOR_IN1, GPIO.LOW)
        else:
            GPIO.output(MOTOR_IN1, GPIO.HIGH)
            
        time.sleep(0.1)
except KeyboardInterrupt:
    GPIO.cleanup()`);
    }
  }, [editorLanguage, setEditorCode]);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Robot Programming Lab</h2>
          <p className="text-gray-400 text-sm">Write embedded C++ sketches or Raspberry Pi Python scripts to govern custom autonomous paths.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <select 
            value={editorLanguage} 
            onChange={(e) => setEditorLanguage(e.target.value)}
            className="bg-gray-900 border border-cyan-950/60 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="cpp">Arduino C++</option>
            <option value="python">Raspberry Pi Python</option>
          </select>

          <button 
            onClick={executeCodeDryRun}
            disabled={isCompiling}
            className="px-6 py-2 bg-cyan-500 text-black text-xs font-bold rounded hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
            {isCompiling ? "Compiling..." : (
              <>
                <Play className="w-4 h-4 fill-black" /> Upload & Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code editor split layout */}
      <div className="flex-grow grid lg:grid-cols-3 gap-6 items-stretch min-h-[400px]">
        
        {/* Editor Textarea */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border-cyan-950/60 overflow-hidden flex flex-col min-h-[350px]">
          <div className="bg-gray-900/80 px-4 py-2.5 border-b border-gray-800 flex items-center gap-2 text-xs font-mono text-gray-400">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>main.{editorLanguage === "cpp" ? "ino" : "py"}</span>
          </div>
          
          <textarea
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            className="w-full flex-grow bg-gray-950 p-6 font-mono text-xs text-cyan-100 focus:outline-none resize-none leading-relaxed border-none"
            spellCheck="false"
          />
        </div>

        {/* Shell Terminal Console */}
        <div className="glass-panel rounded-2xl border-cyan-950/60 overflow-hidden flex flex-col bg-gray-950">
          <div className="bg-gray-900/80 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Terminal Output</span>
            <button 
              onClick={() => setTerminalOutput("")}
              className="text-[10px] hover:text-white"
            >
              Clear
            </button>
          </div>
          
          <div className="p-4 font-mono text-xs text-green-400 overflow-y-auto flex-1 whitespace-pre leading-relaxed min-h-[150px]">
            {terminalOutput}
            {codeErrors.map((err, idx) => (
              <div key={idx} className="text-red-400 mt-2">
                {err}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
