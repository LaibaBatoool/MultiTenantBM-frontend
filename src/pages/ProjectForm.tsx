import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../api/axios';
import { createProject, updateProject } from '../api/projects';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

const STATUS_OPTIONS = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];

interface CustomerOption {
  id: number;
  name: string;
}

export default function ProjectForm() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const loadCustomers = async () => {
    if (!selectedBusinessUnit?.id) {
      setCustomers([]);
      return;
    }

    try {
      const response = await api.get('/master-data/customer', {
        params: { businessUnitId: selectedBusinessUnit.id },
      });
      setCustomers(response.data.companies || response.data.data || []);
    } catch (error) {
      message.error('Failed to load customers.');
    }
  };

  const loadProject = async () => {
    if (!id || !selectedBusinessUnit?.id) return;

    try {
      const response = await api.get(`/projects/${id}`, {
        params: { businessUnitId: selectedBusinessUnit.id },
      });
      const project = response.data.project;
      form.setFieldsValue({
        code: project.code,
        name: project.name,
        customerId: project.customerId || undefined,
        description: project.description || undefined,
        startDate: dayjs(project.startDate),
        endDate: project.endDate ? dayjs(project.endDate) : undefined,
        status: project.status,
        budget: project.budget || undefined,
      });
    } catch (error) {
      message.error('Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    if (isEdit) {
      loadProject();
    } else {
      form.setFieldsValue({ startDate: dayjs(), status: 'Planning' });
    }
  }, [selectedBusinessUnit, id]);

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    const payload = {
      code: values.code,
      name: values.name,
      customerId: values.customerId || undefined,
      description: values.description || undefined,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
      status: values.status,
      budget: values.budget || undefined,
    };

    try {
      if (isEdit && id) {
        await updateProject(+id, payload, selectedBusinessUnit.id);
        message.success('Project updated successfully.');
      } else {
        await createProject(payload, selectedBusinessUnit.id);
        message.success('Project created successfully.');
      }

      navigate('/master-data/projects');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Project cant be saved.');
    } finally {
      setSaving(false);
    }
  };

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
          {isEdit ? 'Edit Project' : 'Add Project'}
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card loading={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="code"
                label="Project Code"
                rules={[{ required: true, message: 'Project code is required.' }]}
              >
                <Input placeholder="e.g. PRJ-001" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[{ required: true, message: 'Project name is required.' }]}
              >
                <Input placeholder="e.g. Islamabad Warehouse" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="customerId" label="Customer">
                <Select
                  allowClear
                  showSearch
                  placeholder="Select customer (optional)"
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: customer.name,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Start date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select options={STATUS_OPTIONS.map((status) => ({ value: status, label: status }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="budget" label="Budget">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={1} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Project
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}