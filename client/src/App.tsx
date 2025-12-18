import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import SalesEntryForm from "@/components/SalesEntryForm";
import SettingsPanel from "@/components/SettingsPanel";
import LoginScreen from "@/components/LoginScreen";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import type { SalesSubmission, SalesRep, AppSettings } from "@shared/schema";

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  todayRevenue: number;
  weekSales: number;
  weekRevenue: number;
  monthSales: number;
  monthRevenue: number;
  pendingSync: number;
  syncedCount: number;
  errorCount: number;
}

function MainApp() {
  const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('dashboard');

  const { data: salesRep } = useQuery<SalesRep | null>({
    queryKey: ['/api/sales-reps/me'],
    enabled: isAuthenticated,
  });

  const { data: submissions = [], isLoading: salesLoading, refetch: refetchSales } = useQuery<SalesSubmission[]>({
    queryKey: ['/api/sales'],
    enabled: isAuthenticated,
  });

  const { data: settings = {
    webhookUrl: '',
    googleSheetId: '',
    googleSheetTab: 'Sales',
    lindyWebhookUrl: '',
    lindyApiKey: '',
    retellApiKey: '',
    retellAgentId: '',
    resendApiKey: '',
    resendFromEmail: '',
    resendToEmail: '',
    claudeApiKey: ''
  }, refetch: refetchSettings } = useQuery<Partial<AppSettings>>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest('POST', '/api/sales', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Sale submitted",
        description: settings.webhookUrl 
          ? "Sale submitted and synced successfully" 
          : "Sale saved. Configure webhook in settings to sync.",
      });
      setCurrentView('dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit sale",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings saved",
        description: "Your integration settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'User';
  const userRole: 'admin' | 'rep' = salesRep?.role === 'admin' ? 'admin' : 'rep';
  const userDivision = salesRep?.division || 'all';

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    logout();
  };

  const handleSubmission = (formData: Record<string, any>) => {
    const submissionData = {
      ...formData,
      submittedBy: user?.id,
      submittedByName: userName,
      installationDate: formData.installationDate ? new Date(formData.installationDate) : null,
    };
    createSaleMutation.mutate(submissionData);
  };

  const handleSaveSettings = (newSettings: Record<string, any>) => {
    updateSettingsMutation.mutate(newSettings);
  };

  if (authLoading) {
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

  const mappedSubmissions = submissions.map(s => ({
    ...s,
    submittedAt: s.submittedAt ? new Date(s.submittedAt) : new Date(),
    status: (s.status || 'pending') as 'pending' | 'synced' | 'error',
  }));

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header
            userName={userName}
            userRole={userRole}
            userImage={user?.profileImageUrl || undefined}
            currentView={currentView}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            sidebarTrigger={<SidebarTrigger data-testid="button-sidebar-toggle" />}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {currentView === 'dashboard' && (
                <Dashboard
                  submissions={mappedSubmissions}
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
                  isSubmitting={createSaleMutation.isPending}
                />
              )}
              
              {currentView === 'settings' && (
                <SettingsPanel
                  settings={{
                    webhookUrl: settings.webhookUrl || '',
                    googleSheetId: settings.googleSheetId || '',
                    googleSheetTab: settings.googleSheetTab || 'Sales',
                    lindyWebhookUrl: settings.lindyWebhookUrl || '',
                    lindyApiKey: settings.lindyApiKey || '',
                    retellApiKey: settings.retellApiKey || '',
                    retellAgentId: settings.retellAgentId || '',
                    resendApiKey: settings.resendApiKey || '',
                    resendFromEmail: settings.resendFromEmail || '',
                    resendToEmail: settings.resendToEmail || '',
                    claudeApiKey: settings.claudeApiKey || '',
                  }}
                  onSave={handleSaveSettings}
                  onBack={() => setCurrentView('dashboard')}
                  isSaving={updateSettingsMutation.isPending}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
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
