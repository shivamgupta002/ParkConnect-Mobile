export interface Subscription {
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string | null;
}