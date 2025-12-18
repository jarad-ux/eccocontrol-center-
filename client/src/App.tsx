import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import SalesEntryForm from "@/components/SalesEntryForm";
import SettingsPanel from "@/components/SettingsPanel";
import LoginScreen from "@/components/LoginScreen";
import { useAuth } from "@/hooks/use-auth";

// todo: remove mock data - will come from API
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

// todo: remove mock data
const MOCK_SUBMISSIONS: SalesSubmission[] = [
  {
    id: '1',
    customerFirstName: 'John',
    customerLastName: 'Smith',
    customerCity: 'Las Vegas',
    customerState: 'NV',
    equipmentType: 'central_air',
    saleAmount: '8500',
    division: 'NV',
    leadSource: 'lead',
    submittedByName: 'Joey Majors',
    submittedAt: new Date(),
    status: 'synced'
  },
  {
    id: '2',
    customerFirstName: 'Sarah',
    customerLastName: 'Johnson',
    customerCity: 'Baltimore',
    customerState: 'MD',
    equipmentType: 'heat_pump',
    saleAmount: '12500',
    division: 'MD',
    leadSource: 'self',
    submittedByName: 'Demo Rep',
    submittedAt: new Date(Date.now() - 86400000),
    status: 'pending'
  },
  {
    id: '3',
    customerFirstName: 'Mike',
    customerLastName: 'Williams',
    customerCity: 'Atlanta',
    customerState: 'GA',
    equipmentType: 'gas_furnace',
    saleAmount: '6800',
    division: 'GA',
    leadSource: 'lead',
    submittedByName: 'Joey Majors',
    submittedAt: new Date(Date.now() - 172800000),
    status: 'synced'
  }
];

function MainApp() {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('dashboard');
  const [submissions, setSubmissions] = useState<SalesSubmission[]>(MOCK_SUBMISSIONS);
  const [settings, setSettings] = useState({
    webhookUrl: '',
    googleSheetId: '',
    googleSheetTab: 'Sales',
    lidyWebhookUrl: '',
    lidyApiKey: '',
    retellApiKey: '',
    retellAgentId: '',
    resendApiKey: '',
    resendFromEmail: '',
    resendToEmail: ''
  });

  // todo: replace with actual user data from auth
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'User';
  const userRole: 'admin' | 'rep' = 'admin'; // todo: get from sales_reps table
  const userDivision = 'all'; // todo: get from sales_reps table

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    logout();
  };

  const handleSubmission = (formData: Record<string, any>) => {
    const submission: SalesSubmission = {
      id: Date.now().toString(),
      customerFirstName: formData.customerFirstName,
      customerLastName: formData.customerLastName,
      customerCity: formData.customerCity,
      customerState: formData.customerState,
      equipmentType: formData.equipmentType,
      saleAmount: formData.saleAmount,
      division: formData.division,
      leadSource: formData.leadSource,
      submittedByName: userName,
      submittedAt: new Date(),
      status: settings.webhookUrl ? 'synced' : 'pending'
    };
    setSubmissions(prev => [submission, ...prev]);
    toast({
      title: "Sale submitted",
      description: settings.webhookUrl 
        ? "Sale submitted and synced successfully" 
        : "Sale saved. Configure webhook in settings to sync.",
    });
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-2xl font-bold animate-pulse">
          GE
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={userName}
        userRole={userRole}
        userImage={user?.profileImageUrl || undefined}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main className="p-6 max-w-7xl mx-auto">
        {currentView === 'dashboard' && (
          <Dashboard
            submissions={submissions}
            onNewSale={() => setCurrentView('new-sale')}
            userName={userName}
            userRole={userRole}
          />
        )}
        
        {currentView === 'new-sale' && (
          <SalesEntryForm
            userDivision={userDivision}
            onSubmit={handleSubmission}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        
        {currentView === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSave={setSettings}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
