import { useParams } from 'react-router-dom';
import OrdersAdminPage from './Orders';

const OrdersByStatus = () => {
  const { status } = useParams<{ status: string }>();
  
  const getPageTitle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Orders';
      case 'confirmed':
        return 'Confirmed Orders';
      case 'shipped':
        return 'Shipped Orders';
      case 'delivered':
        return 'Delivered Orders';
      case 'cancelled':
        return 'Cancelled Orders';
      case 'refunded':
        return 'Refunded Orders';
      default:
        return 'Orders';
    }
  };

  if (!status) {
    return <OrdersAdminPage />;
  }

  return (
    <OrdersAdminPage 
      statusFilter={status} 
      pageTitle={getPageTitle(status)}
    />
  );
};

export default OrdersByStatus;