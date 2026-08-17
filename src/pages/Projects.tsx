import { useEffect, useState } from 'react';
import { Button, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getProjects, type ProjectRecord } from '../api/projects';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  Planning: 'default',
  Active: 'green',
  'On Hold': 'orange',
  Completed: 'blue',
  Cancelled: 'red',
};

export default function Projects() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    if (!selectedBusinessUnit?.id) {
      setProjects([]);
      return;
    }

    setLoading(true);

    try {
      const projectList = await getProjects(selectedBusinessUnit.id);
      setProjects(projectList);
    } catch (error) {
      message.error('Failed to load Projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedBusinessUnit]);

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, record: ProjectRecord) => (
        <a onClick={() => navigate(`${record.id}/edit`)}>{record.name}</a>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: unknown, record: ProjectRecord) => record.customer?.name || '',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (value: string) => dayjs(value).format('DD-MMM-YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={STATUS_COLORS[value] || 'default'}>{value}</Tag>,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      align: 'right' as const,
      render: (value: number | null) => (value ? Number(value).toLocaleString() : ''),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Projects ({projects.length})
        </Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
          Add New
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}