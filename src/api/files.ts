import api from './axios';

export interface UploadedFile {
  id: number;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.file;
};