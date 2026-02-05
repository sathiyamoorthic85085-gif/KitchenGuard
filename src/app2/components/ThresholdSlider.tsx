interface ThresholdSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: "red" | "amber" | "orange";
  description: string;
}

const colorClasses = {
  red: {
    bg: "bg-red-500",
    text: "text-red-400",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-400",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-400",
  },
};

export default function ThresholdSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  color,
  description,
}: ThresholdSliderProps) {
  const colors = colorClasses[color];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">{label}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {value} {unit}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${
              color === "red"
                ? "rgb(239 68 68)"
                : color === "amber"
                ? "rgb(245 158 11)"
                : "rgb(249 115 22)"
            } 0%, ${
              color === "red"
                ? "rgb(239 68 68)"
                : color === "amber"
                ? "rgb(245 158 11)"
                : "rgb(249 115 22)"
            } ${percentage}%, rgb(51 65 85) ${percentage}%, rgb(51 65 85) 100%)`,
          }}
        />
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
