import api from './axios';

export interface UploadedFile {
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  storedName: string;
  folder: 'files' | 'images';
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.file;
};

export const deleteFile = async (url: string): Promise<void> => {
  await api.delete('/files', { data: { url } });
};