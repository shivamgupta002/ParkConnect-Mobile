import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from '@/lib/api';
import type {
  Vehicle,
  VehicleCreateInput,
  VehicleListResponse,
  VehicleUpdateInput,
} from '@/lib/types/vehicle';

const PAGE_SIZE = 20;
export const vehiclesQueryKey = ['vehicles'] as const;

export function useVehicles() {
  return useInfiniteQuery({
    queryKey: vehiclesQueryKey,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<VehicleListResponse>('/vehicles', {
        params: { skip: pageParam, limit: PAGE_SIZE },
      });
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.skip + lastPage.vehicles.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: VehicleCreateInput) => {
      const { data } = await api.post<Vehicle>('/vehicles', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: VehicleUpdateInput) => {
      const { data } = await api.put<Vehicle>(`/vehicles/${id}`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
      queryClient.setQueryData(['vehicle', id], data);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/vehicles/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
}

/** Pulls FastAPI's {detail: "..."} out of an AxiosError, else falls back. */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}
