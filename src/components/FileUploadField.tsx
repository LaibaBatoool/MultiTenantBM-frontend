import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, Button, message, Image } from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { uploadFile, deleteFile, type UploadedFile } from '../api/files';
import { SERVER_BASE, resolveFileUrl } from '../constants/api';

interface FileUploadFieldProps {
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  variant?: 'image' | 'document';
  label?: string;
}

export interface FileUploadFieldHandle {
  discardUnsavedUpload: () => void;
}

const FileUploadField = forwardRef<
  FileUploadFieldHandle,
  FileUploadFieldProps
>(({ value, onChange, variant = 'document', label }, ref) => {
  const [loading, setLoading] = useState(false);

  const freshlyUploadedUrl = useRef<string | null>(null);

  const handleBeforeUpload = async (file: File) => {
    setLoading(true);

    try {
      const uploaded = await uploadFile(file);

      if (freshlyUploadedUrl.current) {
        deleteFile(freshlyUploadedUrl.current).catch(() => { });
      }

      freshlyUploadedUrl.current = uploaded.url;
      onChange?.(uploaded);

      message.success('File uploaded');
    } catch (error) {
      message.error('Upload failed');
    } finally {
      setLoading(false);
    }

    return false;
  };

  useImperativeHandle(ref, () => ({
    discardUnsavedUpload: () => {
      if (freshlyUploadedUrl.current) {
        deleteFile(freshlyUploadedUrl.current).catch(() => { });
        freshlyUploadedUrl.current = null;
      }
    },
  }));

  return (
    <div>
      <Upload
        accept={variant === 'image' ? 'image/*' : '.pdf,.docx,.xlsx'}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
      >
        <Button
          icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
          loading={loading}
        >
          {label ||
            (variant === 'image' ? 'Upload Image' : 'Upload File')}
        </Button>
      </Upload>

      {variant === 'image' && value?.url && (
        <div style={{ marginTop: 8 }}>
          <Image
            src={resolveFileUrl(value.url)}
            width={80}
          />
        </div>
      )}

      {variant === 'document' && value?.originalName && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FileOutlined />
          <span>{value.originalName}</span>
        </div>
      )}
    </div>
  );
});

export default FileUploadField;