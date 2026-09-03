export type VehicleType = 'car' | 'bike';

export interface Vehicle {
  id: string;
  vehicle_type: VehicleType;
  vehicle_number: string;
  brand: string;
  model: string;
  color: string;
  emergency_contact: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleListResponse {
  total: number;
  skip: number;
  limit: number;
  vehicles: Vehicle[];
}

// Matches VehicleCreateRequest in app/schemas/vehicle.py
export interface VehicleCreateInput {
  vehicle_type: VehicleType;
  vehicle_number: string;
  brand: string;
  model: string;
  color: string;
  emergency_contact: string;
}

// Matches VehicleUpdateRequest — vehicle_number is deliberately absent
// (immutable after creation, see app/schemas/vehicle.py).
export type VehicleUpdateInput = Partial<Omit<VehicleCreateInput, 'vehicle_number'>>;
