import { useState } from 'react';
import { Upload, Button, message, Image } from 'antd';
import { UploadOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadFile, type UploadedFile } from '../api/files';

interface FileUploadFieldProps {
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  variant?: 'image' | 'document';
  label?: string;
}

//const API_BASE = 'http://192.168.1.157:3000';
const API_BASE = 'http://192.168.10.14:3000';

export default function FileUploadField({ value, onChange, variant = 'document', label }: FileUploadFieldProps) {
  const [loading, setLoading] = useState(false);

  const handleBeforeUpload = async (file: File) => {
    setLoading(true);
    try {
      const uploaded = await uploadFile(file);
      onChange?.(uploaded);
      message.success('File uploaded');
    } catch (error) {
      message.error('Upload failed');
    } finally {
      setLoading(false);
    }
    return false;
  };

  return (
    <div>
      <Upload
        accept={variant === 'image' ? 'image/*' : '.pdf,.docx,.xlsx'}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
      >
        <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />} loading={loading}>
          {label || (variant === 'image' ? 'Upload Image' : 'Upload File')}
        </Button>
      </Upload>

      {variant === 'image' && value?.url && (
        <div style={{ marginTop: 8 }}>
          <Image src={`${API_BASE}${value.url}`} width={80} />
        </div>
      )}

      {variant === 'document' && value?.originalName && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileOutlined />
          <span>{value.originalName}</span>
        </div>
      )}
    </div>
  );
}