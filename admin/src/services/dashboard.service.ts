/**
 * File: dashboard.service.ts
 *
 * Description: Dashboard analytics service that aggregates user, course, and event
 * counts from Supabase for the admin overview.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase';

export interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  upcomingEvents: number;
  engagementRate: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [usersResult, coursesResult, eventsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', new Date().toISOString()),
  ]);

  return {
    totalUsers: usersResult.count ?? 0,
    activeCourses: coursesResult.count ?? 0,
    upcomingEvents: eventsResult.count ?? 0,
    engagementRate: 0,
  };
}
