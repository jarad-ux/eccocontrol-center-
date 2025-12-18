import StatCard from '../StatCard';
import { TrendingUp } from 'lucide-react';

export default function StatCardExample() {
  return (
    <StatCard
      label="Total Sales"
      value={42}
      icon={TrendingUp}
    />
  );
}
