import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Eye, Edit, X, Check, Loader2, RefreshCw, Filter } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertSalesSubmissionSchema, type SalesSubmission } from "@shared/schema";

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

const DIVISIONS = [
  { id: 'nevada', name: 'Nevada (NV)' },
  { id: 'maryland', name: 'Maryland (MD)' },
  { id: 'georgia', name: 'Georgia (GA)' },
  { id: 'delaware', name: 'Delaware (DE)' }
];

const LEAD_SOURCES = [
  { id: 'company', name: 'Company Lead' },
  { id: 'self', name: 'Self-Generated' },
  { id: 'referral', name: 'Referral' },
  { id: 'call_center', name: 'Call Center' }
];

interface SalesPageProps {
  userRole: 'admin' | 'rep';
  userName: string;
}

export default function Sales({ userRole, userName }: SalesPageProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<SalesSubmission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<SalesSubmission>>({});

  const { data: sales = [], isLoading, refetch } = useQuery<SalesSubmission[]>({
    queryKey: ['/api/sales'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesSubmission> }) => {
      const response = await apiRequest('PATCH', `/api/sales/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      toast({ title: "Sale updated", description: "The sale has been updated successfully." });
      setIsEditing(false);
      setSelectedSale(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredSales = sales.filter(sale => {
    const matchesSearch = searchTerm === "" || 
      `${sale.customerFirstName} ${sale.customerLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone?.includes(searchTerm);
    
    const matchesDivision = divisionFilter === "all" || sale.division === divisionFilter;
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    
    const matchesRole = userRole === 'admin' || sale.submittedByName === userName;
    
    return matchesSearch && matchesDivision && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-600">Synced</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getEquipmentName = (id: string | null) => {
    return EQUIPMENT_TYPES.find(e => e.id === id)?.name || id || 'N/A';
  };

  const getDivisionName = (id: string | null) => {
    return DIVISIONS.find(d => d.id === id)?.name || id || 'N/A';
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (sale: SalesSubmission) => {
    setSelectedSale(sale);
    setEditData({ ...sale });
    setIsEditing(true);
  };

  const handleView = (sale: SalesSubmission) => {
    setSelectedSale(sale);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (selectedSale) {
      // Use schema to validate and extract only allowed fields
      const parseResult = insertSalesSubmissionSchema.partial().safeParse(editData);
      if (parseResult.success) {
        updateMutation.mutate({ id: selectedSale.id, data: parseResult.data });
      } else {
        toast({ 
          title: "Validation Error", 
          description: "Please check the form fields and try again.", 
          variant: "destructive" 
        });
      }
    }
  };

  const handleEditChange = (field: keyof SalesSubmission, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6" data-testid="sales-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === 'admin' ? 'View and manage all sales submissions' : 'Your sales submissions'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh-sales">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-sales"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-division-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="select-item-division-all">All Divisions</SelectItem>
                  {DIVISIONS.map(d => (
                    <SelectItem key={d.id} value={d.id} data-testid={`select-item-division-${d.id}`}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="select-item-status-all">All Status</SelectItem>
                  <SelectItem value="pending" data-testid="select-item-status-pending">Pending</SelectItem>
                  <SelectItem value="synced" data-testid="select-item-status-synced">Synced</SelectItem>
                  <SelectItem value="error" data-testid="select-item-status-error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="text-no-sales">
              No sales found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden md:table-cell">Equipment</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden lg:table-cell">Division</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden xl:table-cell">Date</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/50 hover-elevate" data-testid={`row-sale-${sale.id}`}>
                      <td className="py-3 px-2">
                        <div className="font-medium text-foreground" data-testid={`text-customer-name-${sale.id}`}>
                          {sale.customerFirstName} {sale.customerLastName}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-customer-location-${sale.id}`}>
                          {sale.customerCity}, {sale.customerState}
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell text-sm text-muted-foreground" data-testid={`text-equipment-${sale.id}`}>
                        {getEquipmentName(sale.equipmentType)}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-sm text-muted-foreground" data-testid={`text-division-${sale.id}`}>
                        {getDivisionName(sale.division)}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-foreground" data-testid={`text-amount-${sale.id}`}>
                        ${parseFloat(sale.saleAmount || '0').toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center" data-testid={`badge-status-${sale.id}`}>
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="py-3 px-2 hidden xl:table-cell text-sm text-muted-foreground" data-testid={`text-date-${sale.id}`}>
                        {formatDate(sale.submittedAt)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleView(sale)}
                            data-testid={`button-view-sale-${sale.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(sale)}
                            data-testid={`button-edit-sale-${sale.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Sale' : 'Sale Details'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update sale information' : `Submitted by ${selectedSale?.submittedByName} on ${formatDate(selectedSale?.submittedAt)}`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedSale && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerFirstName || ''}
                        onChange={(e) => handleEditChange('customerFirstName', e.target.value)}
                        data-testid="input-edit-first-name"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-first-name">{selectedSale.customerFirstName}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerLastName || ''}
                        onChange={(e) => handleEditChange('customerLastName', e.target.value)}
                        data-testid="input-edit-last-name"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-last-name">{selectedSale.customerLastName}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerPhone || ''}
                        onChange={(e) => handleEditChange('customerPhone', e.target.value)}
                        data-testid="input-edit-phone"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-phone">{selectedSale.customerPhone || 'N/A'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerEmail || ''}
                        onChange={(e) => handleEditChange('customerEmail', e.target.value)}
                        data-testid="input-edit-email"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-email">{selectedSale.customerEmail || 'N/A'}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  {isEditing ? (
                    <Input
                      value={editData.customerAddress || ''}
                      onChange={(e) => handleEditChange('customerAddress', e.target.value)}
                      data-testid="input-edit-address"
                    />
                  ) : (
                    <div className="text-foreground" data-testid="text-address">{selectedSale.customerAddress || 'N/A'}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerCity || ''}
                        onChange={(e) => handleEditChange('customerCity', e.target.value)}
                        data-testid="input-edit-city"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-city">{selectedSale.customerCity}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerState || ''}
                        onChange={(e) => handleEditChange('customerState', e.target.value)}
                        data-testid="input-edit-state"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-state">{selectedSale.customerState}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP</Label>
                    {isEditing ? (
                      <Input
                        value={editData.customerZip || ''}
                        onChange={(e) => handleEditChange('customerZip', e.target.value)}
                        data-testid="input-edit-zip"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-zip">{selectedSale.customerZip}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipment Type</Label>
                    {isEditing ? (
                      <Select
                        value={editData.equipmentType || ''}
                        onValueChange={(val) => handleEditChange('equipmentType', val)}
                      >
                        <SelectTrigger data-testid="select-edit-equipment">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_TYPES.map(e => (
                            <SelectItem key={e.id} value={e.id} data-testid={`select-item-equipment-${e.id}`}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-foreground" data-testid="text-equipment-type">{getEquipmentName(selectedSale.equipmentType)}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tonnage</Label>
                    {isEditing ? (
                      <Input
                        value={editData.tonnage || ''}
                        onChange={(e) => handleEditChange('tonnage', e.target.value)}
                        data-testid="input-edit-tonnage"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-tonnage">{selectedSale.tonnage || 'N/A'}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sale Amount</Label>
                    {isEditing ? (
                      <Input
                        value={editData.saleAmount || ''}
                        onChange={(e) => handleEditChange('saleAmount', e.target.value)}
                        data-testid="input-edit-amount"
                      />
                    ) : (
                      <div className="text-foreground font-medium" data-testid="text-sale-amount">${parseFloat(selectedSale.saleAmount || '0').toLocaleString()}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Down Payment</Label>
                    {isEditing ? (
                      <Input
                        value={editData.downPayment || ''}
                        onChange={(e) => handleEditChange('downPayment', e.target.value)}
                        data-testid="input-edit-down-payment"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-down-payment">${parseFloat(selectedSale.downPayment || '0').toLocaleString()}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Payment</Label>
                    {isEditing ? (
                      <Input
                        value={editData.monthlyPayment || ''}
                        onChange={(e) => handleEditChange('monthlyPayment', e.target.value)}
                        data-testid="input-edit-monthly-payment"
                      />
                    ) : (
                      <div className="text-foreground" data-testid="text-monthly-payment">${parseFloat(selectedSale.monthlyPayment || '0').toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Division</Label>
                    {isEditing ? (
                      <Select
                        value={editData.division || ''}
                        onValueChange={(val) => handleEditChange('division', val)}
                      >
                        <SelectTrigger data-testid="select-edit-division">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIVISIONS.map(d => (
                            <SelectItem key={d.id} value={d.id} data-testid={`select-item-edit-division-${d.id}`}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-foreground" data-testid="text-division">{getDivisionName(selectedSale.division)}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Source</Label>
                    {isEditing ? (
                      <Select
                        value={editData.leadSource || ''}
                        onValueChange={(val) => handleEditChange('leadSource', val)}
                      >
                        <SelectTrigger data-testid="select-edit-lead-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCES.map(s => (
                            <SelectItem key={s.id} value={s.id} data-testid={`select-item-lead-source-${s.id}`}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-foreground" data-testid="text-lead-source">{LEAD_SOURCES.find(s => s.id === selectedSale.leadSource)?.name || selectedSale.leadSource}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipment Notes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.equipmentNotes || ''}
                      onChange={(e) => handleEditChange('equipmentNotes', e.target.value)}
                      data-testid="input-edit-equipment-notes"
                    />
                  ) : (
                    <div className="text-foreground" data-testid="text-equipment-notes">{selectedSale.equipmentNotes || 'N/A'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Installation Notes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.installationNotes || ''}
                      onChange={(e) => handleEditChange('installationNotes', e.target.value)}
                      data-testid="input-edit-installation-notes"
                    />
                  ) : (
                    <div className="text-foreground" data-testid="text-installation-notes">{selectedSale.installationNotes || 'N/A'}</div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div data-testid="badge-status">{getStatusBadge(selectedSale.status)}</div>
                  </div>
                  {selectedSale.syncedAt && (
                    <div className="space-y-2">
                      <Label>Synced At</Label>
                      <div className="text-sm text-muted-foreground" data-testid="text-synced-at">{formatDate(selectedSale.syncedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-edit">
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectedSale(null)} data-testid="button-close-dialog">
                  Close
                </Button>
                <Button onClick={() => setIsEditing(true)} data-testid="button-start-edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
