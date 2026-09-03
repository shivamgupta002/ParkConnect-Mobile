import { z } from 'zod';

// Matches VehicleCreateRequest field-for-field (backend does the real
// validation via not_blank/normalize_vehicle_number field_validators).
export const vehicleFormSchema = z.object({
  vehicle_type: z.enum(['car', 'bike']),
  vehicle_number: z.string().trim().min(1, 'Vehicle number is required'),
  brand: z.string().trim().min(1, 'Brand is required'),
  model: z.string().trim().min(1, 'Model is required'),
  color: z.string().trim().min(1, 'Color is required'),
  emergency_contact: z.string().trim().min(1, 'Emergency contact is required'),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

// vehicle_number omitted — immutable after creation.
export const vehicleUpdateSchema = vehicleFormSchema.omit({ vehicle_number: true });
export type VehicleUpdateFormValues = z.infer<typeof vehicleUpdateSchema>;
