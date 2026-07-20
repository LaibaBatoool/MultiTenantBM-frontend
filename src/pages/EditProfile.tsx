import { Typography, Card } from 'antd';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function EditProfile() {
  const { currentUser } = useAuth();

  return (
    <div>
      <Title level={3}>Edit Profile</Title>
      <Card style={{ maxWidth: 500 }}>
        <p><strong>Full Name:</strong> {currentUser?.fullName}</p>
        <p><strong>Username:</strong> {currentUser?.username}</p>
        <p><strong>Email:</strong> {currentUser?.email}</p>
      </Card>
    </div>
  );
}