/**
 * File: EventsPage.tsx
 *
 * Description: Event management page with CRUD, registration tracking, and status indicators.
 *
 * Author: Navnit(Ninjacode911)
 */

import {
  Plus,
  Calendar,
  Clock,
  Users,
  Radio,
  CheckCircle2,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';

type EventStatus = 'Upcoming' | 'Live' | 'Completed';
type EventCategory = 'Meditation' | 'Wellness' | 'Pranayama' | 'Workshop';

interface MeditationEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  category: EventCategory;
  registrations: number;
  capacity: number;
  status: EventStatus;
  location: string;
}

const MOCK_EVENTS: MeditationEvent[] = [
  {
    id: 'e1',
    title: 'Full Moon Meditation',
    description:
      'A guided group meditation session harnessing the energy of the full moon for deep inner peace and clarity.',
    date: '2026-04-12',
    time: '8:00 PM - 9:30 PM IST',
    instructor: 'Gurudev Sri Sri',
    category: 'Meditation',
    registrations: 342,
    capacity: 500,
    status: 'Upcoming',
    location: 'Virtual (Zoom)',
  },
  {
    id: 'e2',
    title: 'Stress-Free Satsang',
    description:
      'An interactive wellness session combining guided meditation, Q&A with instructors, and community sharing.',
    date: '2026-04-05',
    time: '6:00 PM - 7:30 PM IST',
    instructor: 'Swami Purnachaitanya',
    category: 'Wellness',
    registrations: 128,
    capacity: 200,
    status: 'Live',
    location: 'Virtual (Zoom)',
  },
  {
    id: 'e3',
    title: 'Advanced Pranayama Workshop',
    description:
      'A deep-dive workshop into advanced breathing techniques including Sudarshan Kriya and Bhastrika for experienced practitioners.',
    date: '2026-03-28',
    time: '10:00 AM - 12:00 PM IST',
    instructor: 'Dinesh Ghodke',
    category: 'Pranayama',
    registrations: 89,
    capacity: 100,
    status: 'Completed',
    location: 'Art of Living Ashram, Bangalore',
  },
];

const STATUS_CONFIG: Record<
  EventStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  Upcoming: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Upcoming',
  },
  Live: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    label: 'Live Now',
  },
  Completed: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    label: 'Completed',
  },
};

const CATEGORY_STYLES: Record<EventCategory, string> = {
  Meditation: 'bg-purple-50 text-purple-700',
  Wellness: 'bg-green-50 text-green-700',
  Pranayama: 'bg-blue-50 text-blue-700',
  Workshop: 'bg-amber-50 text-amber-700',
};

export function EventsPage() {
  const upcomingCount = MOCK_EVENTS.filter(
    (e) => e.status === 'Upcoming'
  ).length;
  const liveCount = MOCK_EVENTS.filter((e) => e.status === 'Live').length;
  const completedCount = MOCK_EVENTS.filter(
    (e) => e.status === 'Completed'
  ).length;
  const totalRegistrations = MOCK_EVENTS.reduce(
    (sum, e) => sum + e.registrations,
    0
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Event Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Create and manage meditation events, workshops, and live sessions
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {upcomingCount}
              </p>
              <p className="text-xs text-text-secondary">Upcoming Events</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <Radio size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{liveCount}</p>
              <p className="text-xs text-text-secondary">Live Now</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <CheckCircle2 size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {completedCount}
              </p>
              <p className="text-xs text-text-secondary">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Users size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {totalRegistrations.toLocaleString()}
              </p>
              <p className="text-xs text-text-secondary">
                Total Registrations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {MOCK_EVENTS.map((event) => {
          const statusConfig = STATUS_CONFIG[event.status];
          const fillPercentage = Math.round(
            (event.registrations / event.capacity) * 100
          );

          return (
            <div
              key={event.id}
              className="rounded-xl border border-gray-100 bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-gray-50 p-5">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} ${event.status === 'Live' ? 'animate-pulse' : ''}`}
                      />
                      {statusConfig.label}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[event.category]}`}
                    >
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    {event.title}
                  </h3>
                </div>
                <div className="ml-3 flex items-center gap-1">
                  <button
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                    title="Edit event"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete event"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                  {event.description}
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <Clock size={14} className="flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-text-primary">
                    <Users size={14} className="flex-shrink-0 text-text-secondary" />
                    <span className="font-medium">
                      {event.instructor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-50 px-5 py-3.5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">
                    {event.registrations} / {event.capacity} registered
                  </span>
                  <span className="font-medium text-text-primary">
                    {fillPercentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
