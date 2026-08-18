import { useEffect, useMemo, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';

import { getAccounts, type AccountRecord } from '../api/accounts';
import { createPayment } from '../api/payments';
import { useBusinessUnit } from '../context/BusinessUnitContext';
import { getProjects, type ProjectRecord } from '../api/projects';

import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile, deleteFile } from '../api/files';

const { Title } = Typography;

export default function PaymentsForm() {
  const { selectedBusinessUnit } = useBusinessUnit();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string>();

  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  const loadAccounts = async () => {
    if (!selectedBusinessUnit?.id) {
      setAccounts([]);
      return;
    }

    try {
      const accountList = await getAccounts(selectedBusinessUnit.id);
      setAccounts(accountList);
    } catch (error) {
      message.error('Failed to load accounts.');
    }
  };

  const loadProjects = async () => {
    if (!selectedBusinessUnit?.id) {
      setProjects([]);
      return;
    }

    try {
      const projectList = await getProjects(selectedBusinessUnit.id);
      setProjects(projectList);
    } catch (error) {
      message.error('Failed to load projects.');
    }
  };

  useEffect(() => {
    loadAccounts();
    loadProjects();
    form.setFieldsValue({
      paymentDate: dayjs(),
    });
  }, [selectedBusinessUnit]);

  const cashBankAccounts = useMemo(() => {
    const cashBankGroupIds = accounts
      .filter((account) => account.isGroup && (account.name === 'Cash' || account.name === 'Bank'))
      .map((account) => account.id);

    return accounts.filter(
      (account) => !account.isGroup && cashBankGroupIds.includes(account.parentAccountId as number),
    );
  }, [accounts]);

  const otherAccounts = useMemo(() => accounts.filter((account) => !account.isGroup), [accounts]);

  const handleSubmit = async (values: any) => {
    if (!selectedBusinessUnit?.id) {
      message.warning('Select a business unit first.');
      return;
    }

    setSaving(true);

    try {
      await createPayment(
        {
          paymentDate: values.paymentDate.format('YYYY-MM-DD'),
          paymentAccountId: values.paymentAccountId,
          expenseAccountId: values.expenseAccountId,
          amount: values.amount,
          paidTo: values.paidTo || undefined,
          description: values.description || undefined,
          attachmentPath: values.attachmentPath || undefined,
          projectId: values.projectId || undefined,
        },
        selectedBusinessUnit.id,
      );

      message.success('Payment created successfully.');

      navigate('/finance/cash-bank/payments');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Payment cant be created.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      form.setFieldsValue({ attachmentPath: uploaded.url });
      setAttachmentName(uploaded.originalName);
      message.success('File uploaded successfully.');
    } catch (error) {
      message.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = async () => {
    const currentUrl = form.getFieldValue('attachmentPath');
    form.setFieldsValue({ attachmentPath: undefined });
    setAttachmentName(undefined);

    if (currentUrl) {
      try {
        await deleteFile(currentUrl);
      } catch (error) {
        message.error('Failed to remove uploaded file.');
      }
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
          Add Payment
        </Title>

        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            paymentDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="paymentDate"
                label="Payment Date"
                rules={[{ required: true, message: 'Payment date is required.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="paymentAccountId"
                label="Payment Account (Cash/Bank)"
                rules={[{ required: true, message: 'Payment account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select payment account"
                  options={cashBankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="expenseAccountId"
                label="Expense / Other Account"
                rules={[{ required: true, message: 'Expense/other account is required.' }]}
              >
                <Select
                  showSearch
                  placeholder="Select expense/other account"
                  options={otherAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} - ${account.name}`,
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
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Amount is required.' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="paidTo" label="Paid To / Company">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="projectId" label="Project">
                <Select
                  allowClear
                  showSearch
                  placeholder="Optional"
                  options={projects.map((project) => ({
                    value: project.id,
                    label: `${project.code} - ${project.name}`,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Attachment">
                <Upload
                  maxCount={1}
                  beforeUpload={(file) => {
                    handleFileUpload(file);
                    return false;
                  }}
                  onRemove={handleFileRemove}
                  fileList={attachmentName ? [{ uid: '-1', name: attachmentName, status: 'done' }] : []}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item name="attachmentPath" hidden>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={saving}>
              Save Payment
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}