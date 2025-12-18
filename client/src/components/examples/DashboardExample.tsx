import Dashboard from '../Dashboard';

// todo: remove mock data
const mockSubmissions = [
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
    status: 'synced' as const
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
    status: 'pending' as const
  }
];

export default function DashboardExample() {
  return (
    <div className="p-6 bg-background min-h-screen">
      <Dashboard
        submissions={mockSubmissions}
        onNewSale={() => console.log('New sale clicked')}
        userName="Joey Majors"
        userRole="admin"
      />
    </div>
  );
}
