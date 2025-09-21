import React, { useEffect, useState, useRef } from "react";

interface Props {
  status: "pending" | "processing" | "completed" | "error";
  error?: string | null;
  chunkCount?: number;
}

const ProcessingProgressBar: React.FC<Props> = ({ status, error = null }) => {
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(true);
  const valueRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Animate progress ---
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (status === "processing") {
      valueRef.current = 0;
      setValue(0);

      intervalRef.current = setInterval(() => {
        if (valueRef.current < 99) {
          valueRef.current += 1; // adjust speed here
          setValue(valueRef.current);
        } else {
          clearInterval(intervalRef.current!);
        }
      }, 15);
    }

    if (status === "completed") {
      valueRef.current = 100;
      setValue(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // --- Auto-hide logic ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (status === "completed") {
      // Show for 2.5s after completion, then hide
      setVisible(true); // ensure visible immediately
      timer = setTimeout(() => setVisible(false), 2500);
    } else if (status === "error") {
      // Optionally hide errors automatically after a short period
      timer = setTimeout(() => setVisible(false), 2500);
    } else {
      setVisible(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status]);

  if (!visible || status === "pending") return null;

  const trackColor = "bg-blue-200";
  const barGradient =
    status === "error"
      ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700"
      : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700";

  const progressText =
    status === "processing"
      ? "Vectorization in progress, document will be ready shortly"
      : status === "completed"
      ? "Completed"
      : status === "error"
      ? `Error: ${error}`
      : "Pending...";

  return (
    <div className="w-full">
      <div className={`${trackColor} h-6 rounded-lg overflow-hidden relative`}>
        {/* Progress fill */}
        <div
          className={`${barGradient} h-full rounded-lg transition-all duration-500 ease-in-out`}
          style={{ width: `${value}%` }}
        />
        {/* Text inside */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium px-2 text-center text-white drop-shadow-md">
          {progressText}
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgressBar;
