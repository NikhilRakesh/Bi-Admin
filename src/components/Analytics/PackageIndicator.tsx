export default function PackageIndicator({
    tier,
    count,
    color,
  }: {
    tier: string;
    count: number;
    color: string;
  }) {
    return (
      <div className="flex justify-between items-center">
        <span className={`text-sm px-2 py-1 rounded ${color}`}>{tier}</span>
        <span className="font-medium">{count}</span>
      </div>
    );
  }