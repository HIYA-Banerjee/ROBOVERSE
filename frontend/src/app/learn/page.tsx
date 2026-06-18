"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Zap, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  HelpCircle, 
  Workflow, 
  GraduationCap,
  Bookmark,
  MessageSquareCode
} from "lucide-react";
import { API_BASE_URL } from "@/config";

// Lesson definitions
const LESSONS = [
  {
    id: 1,
    title: "Lesson 1: Introduction to Robotics",
    category: "Robotics Fundamentals",
    icon: GraduationCap,
    content: `### What is a Robot?
A robot is an autonomous machine capable of sensing its environment, processing information, and performing physical actions in the real world. Unlike purely virtual systems, robots interface directly with physical physics.

### The Four Pillars of Robotics:
1. **Controller (The Brain)**: A microcontroller (like Arduino, ESP32) or a microprocessor (like Raspberry Pi) that runs the control program.
2. **Sensors (The Eyes & Ears)**: Devices that gather information about the environment (e.g., Ultrasonic distance sensors, Camera modules, temperature sensors).
3. **Actuators (The Muscles)**: Components that produce physical movement (e.g., DC motors, Servo motors, Stepper motors).
4. **Power Supply (The Heart)**: Batteries and voltage regulators that supply stable electrical current to the components.

### Kinematics and Control Loops
Robots navigate the world using kinematics—the study of motion without considering the forces that cause it. A feedback control loop continuously reads sensors, calculates deviations from targets, and adjusts actuator speed/direction.`,
    quiz: {
      question: "Which component acts as the 'muscles' of the robot, translating electrical signals into mechanical motion?",
      options: [
        "A photoresistor (LDR sensor)",
        "An actuator (like a DC motor or Servo)",
        "A microcontroller (like ESP32)",
        "A lithium-polymer battery pack"
      ],
      answerIndex: 1
    }
  },
  {
    id: 2,
    title: "Lesson 2: Voltage, Current, and Ground (GND)",
    category: "Electronics Basics",
    icon: Zap,
    content: `### Electrical Currents and Logic Levels
To safely build and wire robotics, we must understand fundamental electrical properties:

* **Voltage (V)**: The potential difference or electrical pressure that drives current (measured in Volts). Microcontrollers typically operate at **3.3V** or **5.0V** logic levels.
* **Current (I)**: The rate of flow of electric charge (measured in Amperes). Microcontroller IO pins can typically output very little current (e.g., 20mA max on Arduino). Actuators require much higher currents (200mA to 2A+).
* **Resistance (R)**: The opposition to current flow (measured in Ohms). Used to limit current to protect LEDs or create voltage dividers.

### The Critical Common Ground (GND) Rule
Voltage is always relative. A sensor measuring 5V means its signal pin is 5V *higher than its ground reference point*. 
If you power your sensor with one battery, and your microcontroller with a USB cable, they must share a **Common Ground**. 
Connecting the Ground (GND) pins of both systems aligns their reference points. **Without a common ground, communication signals will fail or be extremely noisy.**`,
    quiz: {
      question: "Why must a separate battery pack powering motors and an Arduino controller share a common GND connection?",
      options: [
        "To allow the motor battery to charge the Arduino controller",
        "To establish a shared reference point of 0V for logical communication signals",
        "To increase the overall voltage supplied to the motors",
        "To double the clock speed of the Arduino microcontroller"
      ],
      answerIndex: 1
    }
  },
  {
    id: 3,
    title: "Lesson 3: Understanding Sensors & Data Streams",
    category: "Sensors & Feedback",
    icon: HelpCircle,
    content: `### Interactive Sensing
Sensors are transducers that convert physical phenomena into electrical signals. They are categorized by output type:

1. **Digital Sensors**: Output a binary HIGH or LOW state. (e.g., an IR obstacle sensor triggers HIGH when an object is detected).
2. **Analog Sensors**: Output a varying voltage range (e.g., a photoresistor outputs 0V to 5V depending on light intensity). This requires an Analog-to-Digital Converter (ADC) pin.
3. **Protocol-based Sensors**: Communicate over serial buses like I2C, SPI, or UART (e.g., MPU6050 Gyroscope, Camera modules).

### Ultrasonic Distance Sensing (HC-SR04)
The ultrasonic sensor operates on the echo-location principle:
* A high trigger pulse (**TRIG**) triggers the transmitter to emit an 8-cycle ultrasonic burst at 40 kHz.
* The wave travels through the air, bounces off obstacles, and returns.
* The receiver detects the echo, causing the **ECHO** pin to output a pulse width matching the wave's flight time.
* Distance is calculated as: \`Distance = (Time * Speed of Sound) / 2\`.`,
    quiz: {
      question: "What is the speed of sound coefficient in centimeters per microsecond used to compute distance with the HC-SR04 sensor?",
      options: [
        "0.0172 cm/µs",
        "0.0343 cm/µs (or divide flight duration by 58)",
        "343.0 cm/µs",
        "0.0981 cm/µs"
      ],
      answerIndex: 1
    }
  },
  {
    id: 4,
    title: "Lesson 4: Actuators, Drivers, and Speed Control",
    category: "Actuators & Drivers",
    icon: Workflow,
    content: `### High-Current Actuators
Microcontroller pins can only deliver low-power logic signals. Direct connection to high-current loads like DC motors will destroy the microcontroller. 

### H-Bridge and L298N Motor Drivers
To control the speed and direction of DC motors, we use an **H-Bridge driver** (like the L298N):
* **Direction Control**: By toggling input pins (IN1 & IN2), the H-bridge changes the polarity of the voltage applied to the motor, switching its spin direction.
* **Speed Control (PWM)**: Pulse Width Modulation rapidly cycles power ON and OFF. By adjusting the duty cycle (the ratio of ON time to total cycle time), we vary the average voltage, controlling the motor's speed.
* **External Power**: The driver channels power directly from an external high-current battery pack, keeping the controller's logic circuits isolated and safe.`,
    quiz: {
      question: "Which input pins on an H-Bridge driver control the rotational direction of a DC motor?",
      options: [
        "VCC and GND inputs",
        "IN1 and IN2 control logic inputs",
        "ENA and ENB speed enable jumpers",
        "OUT1 and OUT2 motor connections"
      ],
      answerIndex: 1
    }
  }
];

export default function LearnPage() {
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showTutorContext, setShowTutorContext] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<any[]>([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedScore = localStorage.getItem("roboverse_score");
    const savedBadges = localStorage.getItem("roboverse_badges");
    if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedBadges) setEarnedBadges(JSON.parse(savedBadges));
  }, []);

  const handleSelectAnswer = (idx: number) => {
    if (quizChecked) return;
    setSelectedAnswer(idx);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null || quizChecked) return;
    setQuizChecked(true);

    const activeLesson = LESSONS[selectedLesson];
    if (selectedAnswer === activeLesson.quiz.answerIndex) {
      const newScore = score + 25;
      setScore(newScore);
      localStorage.setItem("roboverse_score", newScore.toString());

      if (!earnedBadges.includes(activeLesson.category)) {
        const updatedBadges = [...earnedBadges, activeLesson.category];
        setEarnedBadges(updatedBadges);
        localStorage.setItem("roboverse_badges", JSON.stringify(updatedBadges));
      }
    }
  };

  const handleLessonChange = (idx: number) => {
    setSelectedLesson(idx);
    setSelectedAnswer(null);
    setQuizChecked(false);
    setShowTutorContext(false);
    setTutorMessages([]);
  };

  const askTutorAboutLesson = async () => {
    if (tutorLoading) return;
    
    const activeLesson = LESSONS[selectedLesson];
    const initialPrompt = `I am studying "${activeLesson.title}". The lesson covers: ${activeLesson.content.substring(0, 500)}...\n\nCan you explain the main concepts in more detail and give me a practical robotics application for this?`;
    
    setTutorMessages([{ role: "user", content: initialPrompt }]);
    setShowTutorContext(true);
    setTutorLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: initialPrompt }],
          context: { lesson_id: activeLesson.id, title: activeLesson.title }
        })
      });
      const data = await res.json();
      setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setTutorMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI Tutor. Please ensure backend is running." }]);
    } finally {
      setTutorLoading(false);
    }
  };

  const sendTutorMessage = async () => {
    if (!tutorInput.trim() || tutorLoading) return;

    const userMsg = { role: "user", content: tutorInput };
    const updatedMessages = [...tutorMessages, userMsg];
    setTutorMessages(updatedMessages);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          context: { lesson_title: LESSONS[selectedLesson].title }
        })
      });
      const data = await res.json();
      setTutorMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setTutorMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI Tutor." }]);
    } finally {
      setTutorLoading(false);
    }
  };

  const resetProgress = () => {
    setScore(0);
    setEarnedBadges([]);
    localStorage.removeItem("roboverse_score");
    localStorage.removeItem("roboverse_badges");
  };

  const activeLesson = LESSONS[selectedLesson];
  const LessonIcon = activeLesson.icon;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col cyber-grid">
      {/* Top Header */}
      <header className="glass-panel border-b border-cyan-950 px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold tracking-wider font-mono text-gray-300">
              ROBOVERSE_LEARNING_HUB
            </span>
          </div>
        </div>

        {/* Global Progress Metrics */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400">SCORE:</span>
            <span className="text-yellow-500 font-bold">{score} XP</span>
          </div>
          <div className="flex items-center gap-2 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400">BADGES:</span>
            <span className="text-cyan-400 font-bold">{earnedBadges.length} / {LESSONS.length}</span>
          </div>
          <button 
            onClick={resetProgress}
            className="text-[10px] text-red-500 hover:text-red-400 font-mono hover:underline"
          >
            Reset Progress
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 overflow-hidden max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar: Lesson Selection */}
        <section className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <div className="glass-panel p-4 rounded-2xl border-cyan-950/80">
            <h2 className="text-xs uppercase text-gray-400 font-mono tracking-widest font-extrabold mb-4 px-2">Course syllabus</h2>
            <div className="space-y-2">
              {LESSONS.map((lesson, idx) => {
                const Icon = lesson.icon;
                const isSelected = selectedLesson === idx;
                const isCompleted = earnedBadges.includes(lesson.category);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonChange(idx)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? "bg-cyan-950/50 border-cyan-500/60 text-white" 
                        : "bg-gray-900/30 border-gray-900 hover:border-gray-800 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-800 text-gray-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono tracking-wide">{lesson.category}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[170px]">{lesson.title}</div>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badges Cabinet */}
          <div className="glass-panel p-4 rounded-2xl border-cyan-950/80 flex-grow">
            <h2 className="text-xs uppercase text-gray-400 font-mono tracking-widest font-extrabold mb-3 px-2">Unlocked badges</h2>
            {earnedBadges.length === 0 ? (
              <div className="text-xs text-gray-500 italic p-4 text-center">
                Complete lesson quizzes to unlock badges here.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {earnedBadges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-3 bg-cyan-950/20 border border-cyan-950 rounded-xl text-center">
                    <Award className="w-8 h-8 text-yellow-500 mb-1" />
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Center/Right: Selected Lesson Details & Interactive Quiz */}
        <section className="flex-1 flex flex-col gap-6 overflow-y-auto max-h-[85vh] pr-2">
          
          {/* Lesson Content Area */}
          <article className="glass-panel p-6 md:p-8 rounded-2xl border-cyan-950/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-cyan-950 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <LessonIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-mono font-bold">{activeLesson.category}</span>
                  <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">{activeLesson.title}</h1>
                </div>
              </div>
              <button
                onClick={askTutorAboutLesson}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 self-start sm:self-center shrink-0 shadow-lg shadow-cyan-500/10"
              >
                <MessageSquareCode className="w-4 h-4 fill-black" />
                ASK AI TUTOR
              </button>
            </div>

            {/* Markdown body styling */}
            <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed space-y-4">
              {activeLesson.content.split("\n\n").map((para, i) => {
                if (para.startsWith("###")) {
                  return <h3 key={i} className="text-base font-bold text-white pt-2">{para.replace("###", "").trim()}</h3>;
                }
                if (para.startsWith("*")) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 text-gray-300">
                      {para.split("\n").map((item, j) => (
                        <li key={j}>{item.replace("*", "").trim()}</li>
                      ))}
                    </ul>
                  );
                }
                if (para.startsWith("1.")) {
                  return (
                    <ol key={i} className="list-decimal pl-5 space-y-1 text-gray-300">
                      {para.split("\n").map((item, j) => (
                        <li key={j}>{item.substring(2).trim()}</li>
                      ))}
                    </ol>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </article>

          {/* Quiz / Assessment Area */}
          <section className="glass-panel p-6 rounded-2xl border-cyan-950/80 bg-gray-900/10 space-y-4">
            <span className="text-[10px] uppercase text-cyan-400 font-mono font-bold tracking-widest flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Lesson Assessment Checkpoint
            </span>
            <p className="text-white font-semibold text-sm">{activeLesson.quiz.question}</p>
            
            <div className="grid md:grid-cols-2 gap-3 pt-2">
              {activeLesson.quiz.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === activeLesson.quiz.answerIndex;
                let btnStyle = "border-gray-800 bg-gray-950/40 text-gray-400 hover:text-gray-200 hover:border-gray-700";
                
                if (isSelected) {
                  btnStyle = "border-cyan-500 bg-cyan-950/20 text-white";
                }
                if (quizChecked) {
                  if (isCorrect) {
                    btnStyle = "border-green-500 bg-green-950/20 text-green-400";
                  } else if (isSelected) {
                    btnStyle = "border-red-500 bg-red-950/20 text-red-400";
                  } else {
                    btnStyle = "border-gray-900 bg-gray-950/10 text-gray-600 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-4 rounded-xl text-left text-xs transition-all border leading-relaxed ${btnStyle}`}
                    disabled={quizChecked}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 items-center pt-2 border-t border-cyan-950/60 mt-4">
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null || quizChecked}
                className="px-6 py-2.5 bg-cyan-500 text-black text-xs font-bold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                SUBMIT ANSWER
              </button>
              {quizChecked && (
                <div className="text-xs font-mono font-semibold flex items-center gap-2">
                  {selectedAnswer === activeLesson.quiz.answerIndex ? (
                    <span className="text-green-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Assessment Passed! +25 XP
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Assessment Failed. Try again by changing lessons.
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Contextual AI Tutor Section */}
          {showTutorContext && (
            <section className="glass-panel p-6 rounded-2xl border-cyan-950/80 space-y-4">
              <div className="flex justify-between items-center border-b border-cyan-950 pb-3">
                <span className="text-xs font-bold text-cyan-400 font-mono">AI TUTOR CONTEXTUAL STREAM</span>
                <button 
                  onClick={() => setShowTutorContext(false)}
                  className="text-[10px] text-gray-500 hover:text-gray-300 font-mono"
                >
                  Close Chat
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-3 p-3 bg-gray-900/50 rounded-xl border border-cyan-950">
                {tutorMessages.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-cyan-950/30 border border-cyan-900/30 text-gray-300 ml-8" 
                      : "bg-gray-950/70 border border-gray-900 text-cyan-200 mr-8"
                  }`}>
                    <span className="font-bold uppercase tracking-wider block mb-1 text-[9px] opacity-65">
                      {msg.role === "user" ? "You" : "Antigravity Tutor"}
                    </span>
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="text-xs text-cyan-400 animate-pulse font-mono">Tutor is compiling response...</div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a follow-up question about this lesson..."
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendTutorMessage()}
                  className="flex-grow bg-gray-950 border border-cyan-950 focus:border-cyan-500 focus:outline-none rounded-lg px-4 py-2 text-xs"
                />
                <button
                  onClick={sendTutorMessage}
                  className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors"
                >
                  Ask
                </button>
              </div>
            </section>
          )}

        </section>

      </main>
    </div>
  );
}
