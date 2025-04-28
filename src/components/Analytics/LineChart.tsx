export default function LineChart({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const maxValue = Math.max(...data, 1);

  const colorMap = {
    blue: "rgba(59, 130, 246, 0.3)",
    green: "rgba(16, 185, 129, 0.3)",
    purple: "rgba(139, 92, 246, 0.3)",
    red: "rgba(239, 68, 68, 0.3)",
    default: "rgba(59, 130, 246, 0.3)",
  };

  const bgColor = colorMap[color as keyof typeof colorMap] || colorMap.default;

  return (
    <div className="flex items-end h-40 gap-1 pt-4">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center  h-full justify-end"
        >
          <div
            className="w-full rounded-t-sm "
            style={{
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: bgColor,
            }}
          ></div>
          <span className="text-xs text-gray-500 mt-1">
            {["M", "T", "W", "T", "F", "S", "S"][index]}
          </span>
        </div>
      ))}
    </div>
  );
}
