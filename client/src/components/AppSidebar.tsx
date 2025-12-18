import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  ExternalLink, 
  DollarSign, 
  Phone, 
  FileCheck, 
  Users, 
  Truck, 
  CreditCard,
  FileSpreadsheet,
  FilePlus
} from "lucide-react";

const EXTERNAL_LINKS = [
  { 
    label: "Payroll", 
    url: "https://goecopayroll.com", 
    icon: DollarSign 
  },
  { 
    label: "Call Center", 
    url: "https://goecollc.com", 
    icon: Phone 
  },
  { 
    label: "Assessment & Rebate", 
    url: "https://eccoclimatecontrol.com", 
    icon: FileCheck 
  },
  { 
    label: "Onboarding", 
    url: "https://ecoonboarding.com", 
    icon: Users 
  },
  { 
    label: "Dispatch", 
    url: "https://work.dispatch.me/jobs/all", 
    icon: Truck 
  },
  { 
    label: "360 Portal", 
    url: "https://360finance.modernize.com/contractor/login", 
    icon: CreditCard 
  },
  { 
    label: "Daily Install Sheet", 
    url: "https://docs.google.com/spreadsheets/d/1gk879oMHlp-CUe8IltePXSiNsAHOJ9ELECc4H_EtueM/edit?gid=0#gid=0", 
    icon: FileSpreadsheet 
  },
  { 
    label: "New Sales Sheet", 
    url: "https://docs.google.com/spreadsheets/d/1B7I38e82S8etKjfxSFOIDei2vGj2vRPYetcUegQ3ef8/edit?gid=0#gid=0", 
    icon: FilePlus 
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-sm font-bold">
            GE
          </div>
          <span className="font-semibold text-foreground">Go Ecco</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {EXTERNAL_LINKS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">Go Ecco Climate Control</p>
      </SidebarFooter>
    </Sidebar>
  );
}
