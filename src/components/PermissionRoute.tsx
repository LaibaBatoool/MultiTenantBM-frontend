import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PermissionRoute({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <Navigate to="/" />;
}