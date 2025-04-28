export default function PieChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex items-center justify-between">
      <div className="w-32 h-32 rounded-full relative">
        {data.map((item, index) => {
          const percent = (item.value / total) * 100;
          cumulativePercent += percent;

          return (
            <div
              key={index}
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from ${
                  cumulativePercent - percent
                }deg at 50% 50%, ${
                  item.color === "bg-blue-500"
                    ? "#3b82f6"
                    : item.color === "bg-green-500"
                    ? "#10b981"
                    : item.color === "bg-purple-500"
                    ? "#8b5cf6"
                    : "#e5e7eb"
                } 0% ${percent}%, transparent ${percent}% 100%)`,
              }}
            ></div>
          );
        })}
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
            <span className="text-sm">
              {item.name}: {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
