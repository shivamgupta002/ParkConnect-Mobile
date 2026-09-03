import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));

const mockedGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockedJwtDecode = jwtDecode as jest.Mock;

const context = require.context('../app');

const oneVehicle = {
  total: 1,
  skip: 0,
  limit: 20,
  vehicles: [
    {
      id: 'veh_1',
      vehicle_type: 'car',
      vehicle_number: 'KA01AB1234',
      brand: 'Toyota',
      model: 'Innova',
      color: 'White',
      emergency_contact: '+919876500000',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
};

describe('vehicle management', () => {
  let apiMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(api);
    mockedGetItemAsync.mockResolvedValue('fake.token');
    mockedJwtDecode.mockReturnValue({ sub: 'user_1', is_admin: false, exp: Date.now() / 1000 + 3600 });

    // Auto-confirm any Alert.alert (used for the delete confirmation).
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructive = buttons?.find((b) => b.style === 'destructive');
      destructive?.onPress?.();
    });
  });

  afterEach(() => {
    apiMock.restore();
    jest.clearAllMocks();
  });

  it('disables/hides the add button for a free-plan user already at the 1-vehicle limit', async () => {
    apiMock.onGet('/subscriptions/me').reply(200, {
      plan: 'free',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      end_date: null,
    });
    apiMock.onGet('/vehicles').reply(200, oneVehicle);

    renderRouter(context, { initialUrl: '/(owner)/vehicles' });

    await waitFor(() => expect(screen.getByText('Toyota Innova')).toBeTruthy());

    expect(screen.queryByTestId('add-vehicle-fab')).toBeNull();
    expect(screen.getByText(/Free plan is limited to 1 vehicle/i)).toBeTruthy();
  });

  it('surfaces the backend 409 message for a duplicate vehicle number', async () => {
    apiMock.onGet('/subscriptions/me').reply(200, {
      plan: 'premium',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      end_date: null,
    });
    apiMock.onGet('/vehicles').reply(200, { total: 0, skip: 0, limit: 20, vehicles: [] });
    apiMock.onPost('/vehicles').reply(409, {
      detail: 'A vehicle with this vehicle number is already registered.',
    });

    renderRouter(context, { initialUrl: '/(owner)/vehicles/new' });

    fireEvent.changeText(await screen.findByPlaceholderText('KA01AB1234'), 'KA01AB1234');
    fireEvent.changeText(screen.getByPlaceholderText('Toyota'), 'Toyota');
    fireEvent.changeText(screen.getByPlaceholderText('Innova'), 'Innova');
    fireEvent.changeText(screen.getByPlaceholderText('White'), 'White');
    fireEvent.changeText(screen.getByPlaceholderText('+919876500000'), '+919876500000');

    fireEvent.press(screen.getByTestId('save-vehicle-submit'));

    await waitFor(() =>
      expect(screen.getByText('A vehicle with this vehicle number is already registered.')).toBeTruthy()
    );
  });

  it('removes a vehicle from the rendered list once the delete mutation resolves', async () => {
    apiMock.onGet('/subscriptions/me').reply(200, {
      plan: 'premium',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      end_date: null,
    });
    apiMock.onGet('/vehicles').reply(200, oneVehicle);
    apiMock.onDelete('/vehicles/veh_1').reply(204);

    renderRouter(context, { initialUrl: '/(owner)/vehicles' });

    await waitFor(() => expect(screen.getByText('Toyota Innova')).toBeTruthy());

    fireEvent.press(screen.getByText('Delete'));

    await waitFor(() => expect(screen.queryByText('Toyota Innova')).toBeNull());
  });
});
