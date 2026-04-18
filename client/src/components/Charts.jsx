import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
);

const HOURS = ["00","02","04","06","08","10","12","14","16","18","20","22"];
const ZONES = ["North","South","East","West","Centre","Indust."];


// ---------------- TRAFFIC ----------------

export function TrafficChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "line",
      data: {
        labels: HOURS,
        datasets: [
          {
            label: "Traffic",
            data: [300,200,150,250,800,1500,1800,1500,1300,1700,1600,900],
            borderColor: "#00ffc8",
            backgroundColor: "rgba(0,255,200,0.1)",
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
}


// ---------------- POLLUTION ----------------

export function PollutionChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels: ZONES,
        datasets: [
          {
            label: "PM2.5",
            data: [20,15,30,10,25,60],
            backgroundColor: "#f0a500"
          },
          {
            label: "NO2",
            data: [15,10,25,8,20,50],
            backgroundColor: "#00aaff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
}