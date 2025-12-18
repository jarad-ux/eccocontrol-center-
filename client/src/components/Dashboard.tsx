import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "./StatCard";
import SalesTable from "./SalesTable";
import { Plus, TrendingUp, DollarSign, UserPlus, Calendar, Phone, PhoneCall, Clock, CheckCircle } from "lucide-react";

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

interface CallCenterStats {
  configured: boolean;
  error?: boolean;
  message?: string;
  totalCalls?: number;
  todayCalls?: number;
  weekCalls?: number;
  avgDurationSeconds?: number;
  connectedCalls?: number;
  failedCalls?: number;
  successRate?: number;
}

interface DashboardProps {
  submissions: SalesSubmission[];
  onNewSale: () => void;
  userName: string;
  userRole: 'admin' | 'rep';
}

export default function Dashboard({ submissions, onNewSale, userName, userRole }: DashboardProps) {
  const { data: callCenterStats } = useQuery<CallCenterStats>({
    queryKey: ['/api/call-center/stats'],
    refetchInterval: 60000,
  });

  const userSubmissions = userRole === 'admin' 
    ? submissions 
    : submissions.filter(s => s.submittedByName === userName);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySubmissions = userSubmissions.filter(s => {
    const subDate = new Date(s.submittedAt);
    subDate.setHours(0, 0, 0, 0);
    return subDate.getTime() === today.getTime();
  });
  
  const totalValue = userSubmissions.reduce((sum, s) => sum + (parseFloat(s.saleAmount) || 0), 0);
  const selfGenerated = userSubmissions.filter(s => s.leadSource === 'self').length;

  const salesStats = [
    { label: "Today's Sales", value: todaySubmissions.length, icon: Calendar },
    { label: "Total Sales", value: userSubmissions.length, icon: TrendingUp },
    { label: "Self-Generated", value: selfGenerated, icon: UserPlus },
    { label: "Total Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign }
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        {salesStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {callCenterStats?.configured && !callCenterStats.error && (
        <Card data-testid="card-call-center-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Center Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1" data-testid="stat-today-calls">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <PhoneCall className="h-4 w-4" />
                  Today's Calls
                </div>
                <div className="text-2xl font-bold text-foreground">{callCenterStats.todayCalls || 0}</div>
              </div>
              <div className="space-y-1" data-testid="stat-week-calls">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="h-4 w-4" />
                  This Week
                </div>
                <div className="text-2xl font-bold text-foreground">{callCenterStats.weekCalls || 0}</div>
              </div>
              <div className="space-y-1" data-testid="stat-avg-duration">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  Avg Duration
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatDuration(callCenterStats.avgDurationSeconds || 0)}
                </div>
              </div>
              <div className="space-y-1" data-testid="stat-success-rate">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Success Rate
                </div>
                <div className="text-2xl font-bold text-foreground">{callCenterStats.successRate || 0}%</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span data-testid="text-total-calls">Total Calls: <strong className="text-foreground">{callCenterStats.totalCalls || 0}</strong></span>
                <span data-testid="text-connected-calls">Connected: <strong className="text-foreground">{callCenterStats.connectedCalls || 0}</strong></span>
                <span data-testid="text-failed-calls">Failed: <strong className="text-foreground">{callCenterStats.failedCalls || 0}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <SalesTable 
        submissions={userSubmissions.slice(0, 10)} 
        equipmentTypes={EQUIPMENT_TYPES}
      />
    </div>
  );
}
