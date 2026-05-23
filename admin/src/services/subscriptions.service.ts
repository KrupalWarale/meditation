import { fetchFromTable, updateInTable } from './api';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  is_active: boolean;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return fetchFromTable<Subscription>('subscriptions', {
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
  return updateInTable<Subscription>('subscriptions', id, updates);
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return fetchFromTable<SubscriptionPlan>('subscription_plans', {
    orderBy: 'price',
    ascending: true,
  });
}
