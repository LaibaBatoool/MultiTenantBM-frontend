export const API_BASE =
   import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.157:3000/api';
  //import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.11:3000/api';

export const SERVER_BASE =
   import.meta.env.VITE_SERVER_BASE_URL || 'http://192.168.1.157:3000';
 // import.meta.env.VITE_SERVER_BASE_URL || 'http://192.168.10.11:3000';

export const resolveFileUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${SERVER_BASE}${path}`;
};