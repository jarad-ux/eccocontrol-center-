import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
  userName: string;
  userRole: 'admin' | 'rep';
  userImage?: string;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  sidebarTrigger?: ReactNode;
}

export default function Header({ 
  userName, 
  userRole, 
  userImage,
  currentView, 
  onNavigate, 
  onLogout,
  sidebarTrigger
}: HeaderProps) {
  const navItems = ['dashboard', 'new-sale'];
  if (userRole === 'admin') navItems.push('settings');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background" data-testid="header">
      <div className="flex items-center gap-3">
        {sidebarTrigger}
        <div className="hidden md:block">
          <div className="text-sm font-semibold text-foreground">Go Ecco Climate Control</div>
          <div className="text-xs text-muted-foreground">Field Sales System</div>
        </div>
      </div>

      <nav className="flex gap-1">
        {navItems.map(view => (
          <Button
            key={view}
            variant={currentView === view ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onNavigate(view)}
            data-testid={`nav-${view}`}
          >
            {view === 'new-sale' ? 'New Sale' : view.charAt(0).toUpperCase() + view.slice(1)}
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-foreground">{userName}</div>
          <div className="text-xs text-muted-foreground">{userRole === 'admin' ? 'Administrator' : 'Sales Rep'}</div>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src={userImage} alt={userName} />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
