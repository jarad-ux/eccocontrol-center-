import { Button } from "@/components/ui/button";
import StatCard from "./StatCard";
import SalesTable from "./SalesTable";
import { Plus, TrendingUp, DollarSign, UserPlus, Calendar } from "lucide-react";

// todo: remove mock data - this will come from API
const EQUIPMENT_TYPES = [
  { id: 'central_air', name: 'Central Air Conditioner' },
  { id: 'gas_furnace', name: 'Gas Furnace' },
  { id: 'electric_furnace', name: 'Electric Furnace' },
  { id: 'heat_pump', name: 'Heat Pump' },
  { id: 'mini_split', name: 'Mini Split / Ductless' },
  { id: 'package_unit', name: 'Package Unit' },
  { id: 'boiler', name: 'Boiler' },
  { id: 'water_heater', name: 'Water Heater' },
  { id: 'dual_fuel', name: 'Dual Fuel System' },
  { id: 'geothermal', name: 'Geothermal' },
  { id: 'other', name: 'Other' }
];

// todo: remove mock data
interface SalesSubmission {
  id: string;
  customerFirstName: string;
  customerLastName: string;
  customerCity: string;
  customerState: string;
  equipmentType: string;
  saleAmount: string;
  division: string;
  leadSource: string;
  submittedByName: string;
  submittedAt: Date;
  status: 'pending' | 'synced' | 'error';
}

interface DashboardProps {
  submissions: SalesSubmission[];
  onNewSale: () => void;
  userName: string;
  userRole: 'admin' | 'rep';
}

export default function Dashboard({ submissions, onNewSale, userName, userRole }: DashboardProps) {
  // Filter submissions based on role
  const userSubmissions = userRole === 'admin' 
    ? submissions 
    : submissions.filter(s => s.submittedByName === userName);
  
  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySubmissions = userSubmissions.filter(s => {
    const subDate = new Date(s.submittedAt);
    subDate.setHours(0, 0, 0, 0);
    return subDate.getTime() === today.getTime();
  });
  
  const totalValue = userSubmissions.reduce((sum, s) => sum + (parseFloat(s.saleAmount) || 0), 0);
  const selfGenerated = userSubmissions.filter(s => s.leadSource === 'self').length;

  const stats = [
    { label: "Today's Sales", value: todaySubmissions.length, icon: Calendar },
    { label: "Total Sales", value: userSubmissions.length, icon: TrendingUp },
    { label: "Self-Generated", value: selfGenerated, icon: UserPlus },
    { label: "Total Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign }
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === 'admin' ? 'Overview of all sales activity' : 'Your sales performance'}
          </p>
        </div>
        <Button onClick={onNewSale} data-testid="button-new-sale">
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <SalesTable 
        submissions={userSubmissions.slice(0, 10)} 
        equipmentTypes={EQUIPMENT_TYPES}
      />
    </div>
  );
}
