import api from './api';

export interface Vehicle {
  id: string;
  vehicle_type: 'car' | 'bike';
  vehicle_number: string;
  brand: string;
  model: string;
  color: string;
  emergency_contact: string;
  is_active: boolean;
  qr_image_url?: string | null;
  qr_token?: string | null;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get('/vehicles', { params: { limit: 100 } });
  return Array.isArray(data) ? data : data.items ?? data.vehicles ?? [];
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
}

export async function createVehicle(payload: Omit<Vehicle, 'id' | 'is_active' | 'qr_image_url' | 'qr_token'>) {
  const { data } = await api.post('/vehicles', payload);
  return data as Vehicle;
}

export async function deleteVehicle(id: string) {
  await api.delete(`/vehicles/${id}`);
}

export async function generateQr(id: string): Promise<{ token: string; qr_image_url: string }> {
  const { data } = await api.post(`/vehicles/${id}/qr`);
  return data;
}

export async function getMe(): Promise<{ full_name: string; email: string; is_premium: boolean }> {
  const { data } = await api.get('/auth/me');
  return data;
}