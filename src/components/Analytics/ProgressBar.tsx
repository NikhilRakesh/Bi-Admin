export default function ProgressBar({
    label,
    value,
    total,
    color,
  }: {
    label: string;
    value: number;
    total: number;
    color: string;
  }) {
    const percentage = Math.round((value / total) * 100);
    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>
            {percentage}% ({value})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  }
  