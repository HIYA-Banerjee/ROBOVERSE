"use client";

import React, { useState } from "react";
import Link from "next/link";

import { 
  Cpu, 
  Workflow, 
  Terminal, 
  Sparkles, 
  CheckCircle, 
  Zap, 
  HelpCircle, 
  ArrowRight, 
  ShieldAlert,
  Code,
  LineChart,
  Hammer
} from "lucide-react";

export default function LandingPage() {
  const [circuitDemoActive, setCircuitDemoActive] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 cyber-grid hero-bg selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-cyan-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center glow-cyan">
            <Cpu className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            ROBOVERSE AI
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-gray-400 font-semibold">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Interactive Demo</a>
          <a href="#journey" className="hover:text-cyan-400 transition-colors">Learning Journey</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
        </nav>

        <Link 
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-bold text-sm tracking-wider hover:bg-cyan-400 transition-all glow-cyan flex items-center gap-2"
        >
          LAUNCH PLATFORM
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-cyan-500/30 text-cyan-400 text-xs tracking-widest uppercase mb-8 font-semibold">
          <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
          AI-Powered Virtual-to-Physical Robotics Lab
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight mb-6">
          Learn Robotics Without the{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
            Expensive Hardware
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mb-10 leading-relaxed">
          Design circuits, map microcontroller pins, program autonomous code, simulate rigid-body robotics in real-time, and auto-generate physical assembly instructions. Bridge the gap from screen to steel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 text-black font-extrabold tracking-wide hover:bg-cyan-400 transition-all glow-cyan text-lg flex items-center justify-center gap-3"
          >
            Enter Robotics Lab
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#demo" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-gray-200 font-bold hover:bg-gray-800 transition-all text-lg border-gray-800"
          >
            Watch Demo
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl glass-panel border-cyan-950/80 overflow-hidden shadow-2xl relative glow-cyan/10">
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-500 ml-4 font-mono">robo_workspace_v1.0.cfg</span>
          </div>
          <div className="bg-gray-950 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            {/* Visual Schematic */}
            <div className="flex-1 w-full glass-panel p-6 rounded-xl border-cyan-900/40 relative">
              <div className="absolute top-3 right-3 text-cyan-400 text-xs font-mono">Circuit: ESP32 + HC-SR04</div>
              <div className="flex justify-around items-center h-48">
                {/* Controller Unit */}
                <div className="w-24 h-32 rounded-lg border border-cyan-500/40 bg-gray-900/80 p-3 flex flex-col justify-between text-[10px] font-mono">
                  <div className="bg-cyan-950/60 p-1 text-center font-bold text-cyan-400">ESP32</div>
                  <div className="space-y-1 text-left text-gray-500">
                    <div>[3V3] ───</div>
                    <div>[GND] ───</div>
                    <div>[D22] ───</div>
                  </div>
                </div>
                {/* Connecting Lines */}
                <div className="flex-1 flex flex-col justify-center items-center h-full px-2 gap-4 relative">
                  <div className="w-full h-0.5 bg-gradient-to-r from-red-500 to-red-400"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
                </div>
                {/* Sensor Unit */}
                <div className="w-24 h-32 rounded-lg border border-pink-500/40 bg-gray-900/80 p-3 flex flex-col justify-between text-[10px] font-mono">
                  <div className="bg-pink-950/60 p-1 text-center font-bold text-pink-400">HC-SR04</div>
                  <div className="space-y-1 text-right text-gray-500">
                    <div>─── [VCC]</div>
                    <div>─── [GND]</div>
                    <div>─── [TRIG]</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Diagnostics */}
            <div className="w-full md:w-80 text-left space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">AI Circuit Diagnostics</h3>
              <p className="text-gray-400 text-sm">
                Our active validation system parses voltage thresholds, logic limits, and driver requirements in real-time.
              </p>
              <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg flex gap-3 items-start text-xs">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <span className="font-bold text-red-400">LOGIC OVERLOAD:</span> Connecting HC-SR04 Echo (5V logic) directly to ESP32 Pin 22 (3.3V tolerance) will damage the GPIO port. 
                </div>
              </div>
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg flex gap-3 items-start text-xs">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-cyan-400">RECOMMENDATION:</span> Insert a voltage divider (1kΩ and 2kΩ resistors) or a bidirectional level shifter.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto border-t border-cyan-950/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Engineering Sandbox</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to learn robotics, from writing code and simulating dynamics to selecting components.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-cyan-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Wiring Studio</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Drag-and-drop microcontrollers (Arduino, ESP32, Raspberry Pi) and connect sensors or actuators on an interactive circuit canvas.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-pink-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Workflow className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Rigid-Body Simulation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Run custom robots in warehouse, smart home, and obstacle arenas powered by PyBullet and high-fidelity physics.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-violet-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Circuit Validator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Instantly find floating grounds, short circuits, logic-level incompatibilities, and missing motor drivers using rule checkers and AI.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-yellow-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Programming Lab</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Write robot programs in Arduino C++ or Raspberry Pi Python. Compile dry-run checks and stream them to the simulator.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-green-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Hammer className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Hardware Generator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Export step-by-step physical assembly guides, interactive bills of materials, cost predictions, and copy-pasteable files.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-indigo-950/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">RL Lab & Analytics</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Train reinforcement learning controllers (PPO/DQN) in real-time, plotting reward curves and measuring tracking progress.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="px-6 py-20 bg-gray-950 border-t border-cyan-950/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Test the Simulation Logic</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Click below to toggle target motor commands and watch how the validator flags connections or generates code.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-stretch text-left">
            {/* Interactive Control Block */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase font-bold">Simulator Demo Controller</span>
                <h3 className="text-2xl font-bold text-white mt-2 mb-4">Obstacle Avoidance Routine</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Verify how your custom logic interacts with ultrasonic sensor readings. When the distance falls below 20cm, it shuts down forward throttle and fires steering.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-cyan-950">
                  <div className="text-sm">
                    <div className="text-white font-semibold">Ultrasonic Distance</div>
                    <div className="text-xs text-gray-500">Live distance stream</div>
                  </div>
                  <div className={`font-mono font-bold text-lg ${circuitDemoActive ? 'text-red-400' : 'text-cyan-400'}`}>
                    {circuitDemoActive ? "14.2 cm" : "48.7 cm"}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-cyan-950">
                  <div className="text-sm">
                    <div className="text-white font-semibold">Motor Output (ENA)</div>
                    <div className="text-xs text-gray-500">PWM throttle duty cycle</div>
                  </div>
                  <div className="font-mono text-cyan-400 font-bold text-lg">
                    {circuitDemoActive ? "0% (STOP)" : "150 (DRIVE)"}
                  </div>
                </div>

                <button 
                  onClick={() => setCircuitDemoActive(!circuitDemoActive)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-extrabold tracking-wider hover:opacity-90 transition-opacity"
                >
                  {circuitDemoActive ? "SIMULATE OBSTACLE CLEAR" : "SIMULATE OBSTACLE DETECTED"}
                </button>
              </div>
            </div>

            {/* Response Console */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-900 px-4 py-3 border-b border-cyan-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span className="text-xs text-cyan-400 font-mono">generated_arduino.ino</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">C++ Arduino IDE</span>
              </div>
              <div className="bg-gray-950 p-6 font-mono text-xs text-gray-400 overflow-x-auto flex-1 leading-relaxed whitespace-pre select-all">
{`void loop() {
  long distance = readDistance();
  
  if (distance < 20 && distance > 0) {
    // Stop Motor
    analogWrite(MOTOR_ENA, 0);
    digitalWrite(MOTOR_IN1, LOW);
    digitalWrite(MOTOR_IN2, LOW);
    
    // Scan angles...
    myServo.write(45);
    delay(500);
  } else {
    // Drive Forward
    analogWrite(MOTOR_ENA, ${circuitDemoActive ? '0' : '150'});
    digitalWrite(MOTOR_IN1, HIGH);
    digitalWrite(MOTOR_IN2, LOW);
  }
}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Journey Timeline */}
      <section id="journey" className="px-6 py-20 max-w-6xl mx-auto border-t border-cyan-950/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Your Robotics Learning Journey</h2>
          <p className="text-gray-400">Move seamlessly from fundamentals to physical hardware creation.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="absolute top-4 right-4 text-3xl font-extrabold text-cyan-950/60 font-mono">01</span>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Learn Concepts</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Master fundamentals of current loops, digital signals, sensor timing, and PWM voltage in our interactive hub.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="absolute top-4 right-4 text-3xl font-extrabold text-pink-950/60 font-mono">02</span>
            <h3 className="text-lg font-bold text-pink-400 mb-2">Virtual Wire</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Design circuit systems visually. Practice wiring breadboards and mapping sensor pins without risking real components.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="absolute top-4 right-4 text-3xl font-extrabold text-violet-950/60 font-mono">03</span>
            <h3 className="text-lg font-bold text-violet-400 mb-2">Simulate & Code</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Upload C++ or Python code to control your virtual robots. Verify sensors and obstacle avoidance in real-time.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="absolute top-4 right-4 text-3xl font-extrabold text-yellow-950/60 font-mono">04</span>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Build Physical</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Retrieve custom BOM charts, shopping links, step-by-step guides, and flash your compiled code directly to real components.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Mock Section */}
      <section id="pricing" className="px-6 py-20 bg-gray-950 border-t border-cyan-950/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Pricing Plans (Demo)</h2>
          <p className="text-gray-400 mb-16">Choose a plan to power up your robotics experience.</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl text-left flex flex-col justify-between border-gray-900">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Student Basic</h3>
                <p className="text-gray-400 text-xs mb-6">Perfect for self-paced beginners.</p>
                <div className="text-3xl font-extrabold mb-8">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Basic Microcontrollers</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Standard Simulation Arenas</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Rule-based Validator checks</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 mt-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-center text-sm font-bold border border-cyan-950/60 text-white transition-colors block">
                Start Learning
              </Link>
            </div>

            <div className="glass-panel p-8 rounded-2xl text-left flex flex-col justify-between border-cyan-500/30 relative">
              <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-cyan-500 text-black text-[10px] uppercase tracking-widest font-extrabold font-mono">Popular</span>
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">Robotics Pro</h3>
                <p className="text-gray-400 text-xs mb-6">Ideal for engineering students and makers.</p>
                <div className="text-3xl font-extrabold mb-8">$19 <span className="text-sm font-normal text-gray-500">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> All Controllers (including ESP32/Pi)</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Advanced AI Circuit Tutor Integration</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Reinforcement Learning Lab tools</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Full Hardware Export Package</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 mt-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-center text-sm font-extrabold text-black block glow-cyan">
                Unlock Pro Access
              </Link>
            </div>

            <div className="glass-panel p-8 rounded-2xl text-left flex flex-col justify-between border-gray-900">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Educator/Lab</h3>
                <p className="text-gray-400 text-xs mb-6">Best for schools and robotics camps.</p>
                <div className="text-3xl font-extrabold mb-8">$99 <span className="text-sm font-normal text-gray-500">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Classroom progress tracking</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Customizable curriculum modules</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Multi-Robot Swarm Simulator</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Priority school support</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full py-3 mt-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-center text-sm font-bold border border-cyan-950/60 text-white transition-colors block">
                Contact Education
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 py-20 max-w-4xl mx-auto border-t border-cyan-950/50">
        <div className="glass-panel p-8 md:p-12 rounded-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch with our Robotics Lab</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm mb-8">
            Have questions about custom component requests, simulation accuracy, or school licensing? Write to us!
          </p>

          {contactSubmitted ? (
            <div className="p-6 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl text-cyan-400 text-sm font-bold">
              ✓ Message transmitted successfully! Our engineering team will correspond shortly.
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}
              className="space-y-4 text-left"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Name</label>
                  <input required type="text" className="w-full bg-gray-900 border border-cyan-950 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm focus:outline-none text-white" placeholder="Dr. Sarah Connor" />
                </div>
                <div>
                  <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Email</label>
                  <input required type="email" className="w-full bg-gray-900 border border-cyan-950 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm focus:outline-none text-white" placeholder="sarah@cyberdyne.com" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Message</label>
                <textarea required rows={4} className="w-full bg-gray-900 border border-cyan-950 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm focus:outline-none text-white resize-none" placeholder="Write your comments regarding RoboVerse AI here..."></textarea>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-cyan-500 text-black font-extrabold tracking-wide hover:bg-cyan-400 transition-colors block text-sm glow-cyan">
                TRANSMIT MESSAGE
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-950/60 bg-gray-950 px-6 py-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-500" />
          <span className="font-bold text-gray-400">RoboVerse AI R&D</span>
        </div>
        <div>© 2026 RoboVerse AI. Empowering open-source robotics.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
