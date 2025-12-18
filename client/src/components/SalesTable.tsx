import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// todo: remove mock data types - will come from schema
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

interface SalesTableProps {
  submissions: SalesSubmission[];
  equipmentTypes: { id: string; name: string }[];
}

export default function SalesTable({ submissions, equipmentTypes }: SalesTableProps) {
  const getEquipmentName = (id: string) => {
    const eq = equipmentTypes.find(e => e.id === id);
    return eq ? eq.name : id;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-600">Synced</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground text-sm">
              No sales submissions yet. Click "New Sale" to add your first entry.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
        <Badge variant="outline">{submissions.length} total</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} data-testid={`row-sale-${submission.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {submission.customerFirstName} {submission.customerLastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {submission.customerCity}, {submission.customerState}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getEquipmentName(submission.equipmentType)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${parseFloat(submission.saleAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.division}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {submission.submittedByName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(submission.submittedAt), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
