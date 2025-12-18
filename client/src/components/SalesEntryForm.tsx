import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const DIVISIONS = [
  { id: 'NV', name: 'Nevada (NV)' },
  { id: 'MD', name: 'Maryland (MD)' },
  { id: 'GA', name: 'Georgia (GA)' },
  { id: 'DE', name: 'Delaware (DE)' }
];

const BANKS = [
  { id: '360', name: '360 Payments' },
  { id: 'enhancify', name: 'Enhancify' }
];

const LEAD_SOURCES = [
  { id: 'lead', name: 'Company Lead' },
  { id: 'self', name: 'Self-Generated' }
];

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

const TONNAGE_OPTIONS = ['1.5', '2', '2.5', '3', '3.5', '4', '5'];

interface SalesEntryFormProps {
  userDivision: string;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SalesEntryForm({ 
  userDivision, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: SalesEntryFormProps) {
  const [formData, setFormData] = useState({
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerZip: '',
    equipmentType: '',
    tonnage: '',
    equipmentNotes: '',
    division: userDivision === 'all' ? '' : userDivision,
    leadSource: '',
    saleAmount: '',
    financingBank: '',
    downPayment: '',
    monthlyPayment: '',
    installationDate: '',
    installationNotes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.customerFirstName && 
    formData.customerLastName && 
    formData.customerPhone && 
    formData.customerAddress &&
    formData.customerCity &&
    formData.customerState &&
    formData.customerZip &&
    formData.equipmentType &&
    formData.division &&
    formData.leadSource &&
    formData.saleAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="sales-entry-form">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Sale Entry</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter customer and equipment details</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerFirstName">First Name *</Label>
                <Input
                  id="customerFirstName"
                  value={formData.customerFirstName}
                  onChange={(e) => handleChange('customerFirstName', e.target.value)}
                  placeholder="John"
                  data-testid="input-customer-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerLastName">Last Name *</Label>
                <Input
                  id="customerLastName"
                  value={formData.customerLastName}
                  onChange={(e) => handleChange('customerLastName', e.target.value)}
                  placeholder="Smith"
                  data-testid="input-customer-last-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  placeholder="john@example.com"
                  data-testid="input-customer-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Street Address *</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => handleChange('customerAddress', e.target.value)}
                placeholder="123 Main St"
                data-testid="input-customer-address"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-2">
                <Label htmlFor="customerCity">City *</Label>
                <Input
                  id="customerCity"
                  value={formData.customerCity}
                  onChange={(e) => handleChange('customerCity', e.target.value)}
                  placeholder="Las Vegas"
                  data-testid="input-customer-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerState">State *</Label>
                <Input
                  id="customerState"
                  value={formData.customerState}
                  onChange={(e) => handleChange('customerState', e.target.value)}
                  placeholder="NV"
                  maxLength={2}
                  data-testid="input-customer-state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerZip">ZIP *</Label>
                <Input
                  id="customerZip"
                  value={formData.customerZip}
                  onChange={(e) => handleChange('customerZip', e.target.value)}
                  placeholder="89101"
                  data-testid="input-customer-zip"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentType">Equipment Type *</Label>
                <Select value={formData.equipmentType} onValueChange={(v) => handleChange('equipmentType', v)}>
                  <SelectTrigger id="equipmentType" data-testid="select-equipment-type">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tonnage">Tonnage</Label>
                <Select value={formData.tonnage} onValueChange={(v) => handleChange('tonnage', v)}>
                  <SelectTrigger id="tonnage" data-testid="select-tonnage">
                    <SelectValue placeholder="Select tonnage" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONNAGE_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{t} Ton</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentNotes">Equipment Notes</Label>
              <Textarea
                id="equipmentNotes"
                value={formData.equipmentNotes}
                onChange={(e) => handleChange('equipmentNotes', e.target.value)}
                placeholder="Additional details about the equipment..."
                rows={3}
                data-testid="textarea-equipment-notes"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">Division *</Label>
                <Select 
                  value={formData.division} 
                  onValueChange={(v) => handleChange('division', v)}
                  disabled={userDivision !== 'all'}
                >
                  <SelectTrigger id="division" data-testid="select-division">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source *</Label>
                <Select value={formData.leadSource} onValueChange={(v) => handleChange('leadSource', v)}>
                  <SelectTrigger id="leadSource" data-testid="select-lead-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(ls => (
                      <SelectItem key={ls.id} value={ls.id}>{ls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saleAmount">Sale Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="saleAmount"
                    type="number"
                    value={formData.saleAmount}
                    onChange={(e) => handleChange('saleAmount', e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    data-testid="input-sale-amount"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="financingBank">Financing Bank</Label>
                <Select value={formData.financingBank} onValueChange={(v) => handleChange('financingBank', v)}>
                  <SelectTrigger id="financingBank" data-testid="select-financing-bank">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="downPayment"
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => handleChange('downPayment', e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    data-testid="input-down-payment"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={(e) => handleChange('monthlyPayment', e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    data-testid="input-monthly-payment"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Installation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="installationDate">Installation Date</Label>
              <Input
                id="installationDate"
                type="date"
                value={formData.installationDate}
                onChange={(e) => handleChange('installationDate', e.target.value)}
                data-testid="input-installation-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installationNotes">Installation Notes</Label>
              <Textarea
                id="installationNotes"
                value={formData.installationNotes}
                onChange={(e) => handleChange('installationNotes', e.target.value)}
                placeholder="Special instructions for installation..."
                rows={3}
                data-testid="textarea-installation-notes"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 max-w-4xl">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || isSubmitting} data-testid="button-submit-sale">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Submit Sale
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
