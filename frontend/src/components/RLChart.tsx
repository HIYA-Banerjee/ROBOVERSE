"use client";

import React, { useEffect, useRef } from "react";

interface RLChartProps {
  xData: number[];
  yData: number[];
}

export default function RLChart({ xData, yData }: RLChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !chartRef.current) return;

    // Dynamically import plotly.js to bypass SSR compilation errors
    import("plotly.js").then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule;
      
      const trace = {
        x: xData,
        y: yData,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "#06b6d4", size: 6 },
        line: { color: "#0891b2", width: 3, shape: "spline" },
        fill: "tozeroy",
        fillcolor: "rgba(6, 182, 212, 0.05)",
        name: "Mean Reward",
      };

      const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: {
          title: "Training Timesteps",
          gridcolor: "#1e293b",
          tickfont: { color: "#64748b", size: 10 },
          titlefont: { color: "#94a3b8", size: 11 },
          zeroline: false
        },
        yaxis: {
          title: "Mean Episodic Reward",
          gridcolor: "#1e293b",
          tickfont: { color: "#64748b", size: 10 },
          titlefont: { color: "#94a3b8", size: 11 },
          zeroline: false
        },
        margin: { l: 60, r: 20, t: 20, b: 50 },
        height: 280,
        autosize: true
      };

      Plotly.newPlot(chartRef.current, [trace] as any, layout as any, { 
        responsive: true, 
        displayModeBar: false 
      });
    });
  }, [xData, yData]);

  return (
    <div className="w-full bg-gray-950/40 rounded-xl border border-cyan-950/40 overflow-hidden p-2">
      <div ref={chartRef} className="w-full h-[280px]" />
    </div>
  );
}
