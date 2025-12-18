import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Loader2, Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type SalesSubmission } from "@shared/schema";

const EQUIPMENT_TYPES = [
  { id: 'central_air', name: 'Central Air' },
  { id: 'gas_furnace', name: 'Gas Furnace' },
  { id: 'electric_furnace', name: 'Electric Furnace' },
  { id: 'heat_pump', name: 'Heat Pump' },
  { id: 'mini_split', name: 'Mini Split' },
  { id: 'package_unit', name: 'Package Unit' },
  { id: 'boiler', name: 'Boiler' },
  { id: 'water_heater', name: 'Water Heater' },
  { id: 'dual_fuel', name: 'Dual Fuel' },
  { id: 'geothermal', name: 'Geothermal' },
  { id: 'other', name: 'Other' }
];

const DIVISIONS = [
  { id: 'nevada', name: 'NV' },
  { id: 'maryland', name: 'MD' },
  { id: 'georgia', name: 'GA' },
  { id: 'delaware', name: 'DE' }
];

const LEAD_SOURCES = [
  { id: 'self', name: 'Self Generated' },
  { id: 'mars', name: 'MARS' },
  { id: 'dmv', name: 'DMV' }
];

const STATUS_OPTIONS = [
  { id: 'pending', name: 'Pending' },
  { id: 'synced', name: 'Synced' },
  { id: 'error', name: 'Error' }
];

interface SalesPageProps {
  userRole: 'admin' | 'rep';
  userName: string;
}

interface EditingCell {
  rowId: string;
  field: string;
}

export default function Sales({ userRole, userName }: SalesPageProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
      toast({ title: "Updated", description: "Cell updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = searchTerm === "" || 
      `${sale.customerFirstName} ${sale.customerLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerPhone?.includes(searchTerm);
    
    const matchesRole = userRole === 'admin' || sale.submittedByName === userName;
    
    return matchesSearch && matchesRole;
  });

  const handleCellClick = (rowId: string, field: string, currentValue: string) => {
    setEditingCell({ rowId, field });
    setEditValue(currentValue || "");
  };

  const handleSave = (rowId: string, field: string) => {
    updateMutation.mutate({ id: rowId, data: { [field]: editValue } });
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, field: string) => {
    if (e.key === 'Enter') {
      handleSave(rowId, field);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getEquipmentName = (id: string | null) => EQUIPMENT_TYPES.find(e => e.id === id)?.name || id || '';
  const getDivisionName = (id: string | null) => DIVISIONS.find(d => d.id === id)?.name || id || '';
  const getLeadSourceName = (id: string | null) => LEAD_SOURCES.find(l => l.id === id)?.name || id || '';
  const getStatusName = (id: string | null) => STATUS_OPTIONS.find(s => s.id === id)?.name || id || 'Pending';

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  };

  const renderCell = (sale: SalesSubmission, field: keyof SalesSubmission, value: string, width: string = "w-24") => {
    const isEditing = editingCell?.rowId === sale.id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <td className={`border border-border px-1 py-0.5 bg-primary/10 ${width}`}>
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, sale.id, field)}
              className="h-6 text-xs px-1 py-0"
              data-testid={`input-edit-${field}-${sale.id}`}
            />
            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleSave(sale.id, field)}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleCancel}>
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </td>
      );
    }

    return (
      <td 
        className={`border border-border px-2 py-1 text-xs cursor-pointer hover:bg-muted/50 truncate ${width}`}
        onClick={() => handleCellClick(sale.id, field, value)}
        data-testid={`cell-${field}-${sale.id}`}
      >
        {value}
      </td>
    );
  };

  const renderSelectCell = (
    sale: SalesSubmission, 
    field: keyof SalesSubmission, 
    displayValue: string, 
    options: { id: string; name: string }[],
    width: string = "w-20"
  ) => {
    const isEditing = editingCell?.rowId === sale.id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <td className={`border border-border px-1 py-0.5 bg-primary/10 ${width}`}>
          <Select 
            value={editValue} 
            onValueChange={(val) => {
              updateMutation.mutate({ id: sale.id, data: { [field]: val } });
              setEditingCell(null);
            }}
          >
            <SelectTrigger className="h-6 text-xs" data-testid={`select-edit-${field}-${sale.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">{opt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
      );
    }

    return (
      <td 
        className={`border border-border px-2 py-1 text-xs cursor-pointer hover:bg-muted/50 truncate ${width}`}
        onClick={() => handleCellClick(sale.id, field, sale[field] as string || "")}
        data-testid={`cell-${field}-${sale.id}`}
      >
        {displayValue}
      </td>
    );
  };

  const columns = [
    { key: 'customerFirstName', label: 'First Name', width: 'w-24' },
    { key: 'customerLastName', label: 'Last Name', width: 'w-24' },
    { key: 'customerAddress', label: 'Address', width: 'w-36' },
    { key: 'customerCity', label: 'City', width: 'w-24' },
    { key: 'customerState', label: 'State', width: 'w-14' },
    { key: 'customerZip', label: 'ZIP', width: 'w-16' },
    { key: 'customerPhone', label: 'Phone', width: 'w-28' },
    { key: 'customerEmail', label: 'Email', width: 'w-36' },
    { key: 'equipmentType', label: 'Equipment', width: 'w-24', select: true, options: EQUIPMENT_TYPES },
    { key: 'tonnage', label: 'Tons', width: 'w-14' },
    { key: 'saleAmount', label: 'Amount', width: 'w-20' },
    { key: 'downPayment', label: 'Down', width: 'w-18' },
    { key: 'monthlyPayment', label: 'Monthly', width: 'w-18' },
    { key: 'division', label: 'Div', width: 'w-12', select: true, options: DIVISIONS },
    { key: 'leadSource', label: 'Source', width: 'w-24', select: true, options: LEAD_SOURCES },
    { key: 'status', label: 'Status', width: 'w-18', select: true, options: STATUS_OPTIONS },
    { key: 'submittedByName', label: 'Rep', width: 'w-28' },
    { key: 'submittedAt', label: 'Date', width: 'w-20', readonly: true },
  ];

  return (
    <div className="h-full flex flex-col" data-testid="sales-page">
      <div className="flex items-center justify-between gap-4 p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Sales Data</h1>
          <span className="text-sm text-muted-foreground">({filteredSales.length} records)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 w-48 text-sm"
              data-testid="input-search-sales"
            />
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh-sales">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-sales">
            No sales found
          </div>
        ) : (
          <table className="w-max min-w-full border-collapse text-sm" data-testid="sales-spreadsheet">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="border border-border px-2 py-1.5 text-xs font-semibold text-left bg-muted w-8">#</th>
                {columns.map(col => (
                  <th 
                    key={col.key} 
                    className={`border border-border px-2 py-1.5 text-xs font-semibold text-left bg-muted ${col.width}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <tr key={sale.id} className="hover:bg-muted/30" data-testid={`row-sale-${sale.id}`}>
                  <td className="border border-border px-2 py-1 text-xs text-muted-foreground bg-muted/50 w-8">
                    {index + 1}
                  </td>
                  {columns.map(col => {
                    const field = col.key as keyof SalesSubmission;
                    let displayValue = '';
                    
                    if (field === 'equipmentType') {
                      displayValue = getEquipmentName(sale[field] as string);
                    } else if (field === 'division') {
                      displayValue = getDivisionName(sale[field] as string);
                    } else if (field === 'leadSource') {
                      displayValue = getLeadSourceName(sale[field] as string);
                    } else if (field === 'status') {
                      displayValue = getStatusName(sale[field] as string);
                    } else if (field === 'submittedAt') {
                      displayValue = formatDate(sale[field] as Date);
                    } else if (field === 'saleAmount' || field === 'downPayment' || field === 'monthlyPayment') {
                      const num = parseFloat(sale[field] as string || '0');
                      displayValue = num > 0 ? `$${num.toLocaleString()}` : '';
                    } else {
                      displayValue = (sale[field] as string) || '';
                    }

                    if (col.readonly) {
                      return (
                        <td 
                          key={col.key}
                          className={`border border-border px-2 py-1 text-xs text-muted-foreground ${col.width}`}
                          data-testid={`cell-${field}-${sale.id}`}
                        >
                          {displayValue}
                        </td>
                      );
                    }

                    if (col.select && col.options) {
                      return renderSelectCell(sale, field, displayValue, col.options, col.width);
                    }

                    return renderCell(sale, field, (sale[field] as string) || '', col.width);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
