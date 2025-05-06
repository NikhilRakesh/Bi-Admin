export default function MetricCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend: string;
}) {
  return (
    <div className="bg-[#fdfcf8] rounded-xl p-6 shadow-sm border border-[#c5b648]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-opacity-10 bg-gray-500">{icon}</div>
        <h3 className="text-gray-500 font-medium">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-green-500">{trend}</p>
      </div>
    </div>
  );
}
