import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllOrders, useUpdateOrderStatus } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatus } from '../../backend';
import { toast } from 'sonner';

export default function OrderManagement() {
  const { data: orders, isLoading } = useGetAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.completed:
        return 'bg-green-600';
      case OrderStatus.shipped:
        return 'bg-blue-600';
      case OrderStatus.pending:
        return 'bg-yellow-600';
      case OrderStatus.cancelled:
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const total = (Number(order.totalAmountCents) / 100).toFixed(2);
              const date = new Date(Number(order.createdAt) / 1000000).toLocaleDateString();
              const itemCount = order.items.reduce((sum, item) => sum + Number(item.quantity), 0);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{itemCount} items</TableCell>
                  <TableCell className="font-medium">${total}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                        <SelectItem value={OrderStatus.completed}>Completed</SelectItem>
                        <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                        <SelectItem value={OrderStatus.cancelled}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
