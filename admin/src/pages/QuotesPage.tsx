/**
 * File: QuotesPage.tsx
 *
 * Description: Daily quotes management with CRUD, date scheduling, and category filtering.
 *
 * Author: Navnit(Ninjacode911)
 */

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Quote,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
} from 'lucide-react';

type QuoteStatus = 'Scheduled' | 'Unscheduled' | 'Delivered';
type QuoteCategory =
  | 'Mindfulness'
  | 'Peace'
  | 'Wisdom'
  | 'Gratitude'
  | 'Compassion';

interface DailyQuote {
  id: string;
  date: string | null;
  text: string;
  author: string;
  category: QuoteCategory;
  status: QuoteStatus;
}

const MOCK_QUOTES: DailyQuote[] = [
  {
    id: 'q1',
    date: '2026-04-06',
    text: 'The mind is everything. What you think you become. Let your thoughts be guided by compassion and clarity.',
    author: 'Buddha',
    category: 'Wisdom',
    status: 'Scheduled',
  },
  {
    id: 'q2',
    date: '2026-04-07',
    text: 'Peace comes from within. Do not seek it without. Turn inward and discover the stillness that has always been there.',
    author: 'Buddha',
    category: 'Peace',
    status: 'Scheduled',
  },
  {
    id: 'q3',
    date: '2026-04-05',
    text: 'In the midst of movement and chaos, keep stillness inside of you.',
    author: 'Deepak Chopra',
    category: 'Mindfulness',
    status: 'Delivered',
  },
  {
    id: 'q4',
    date: null,
    text: 'Gratitude is the fairest blossom which springs from the soul.',
    author: 'Henry Ward Beecher',
    category: 'Gratitude',
    status: 'Unscheduled',
  },
  {
    id: 'q5',
    date: '2026-04-08',
    text: 'If you want others to be happy, practice compassion. If you want to be happy, practice compassion.',
    author: 'Dalai Lama',
    category: 'Compassion',
    status: 'Scheduled',
  },
];

const ALL_CATEGORIES: QuoteCategory[] = [
  'Mindfulness',
  'Peace',
  'Wisdom',
  'Gratitude',
  'Compassion',
];

const STATUS_STYLES: Record<QuoteStatus, string> = {
  Scheduled: 'bg-blue-50 text-blue-700',
  Unscheduled: 'bg-gray-100 text-gray-600',
  Delivered: 'bg-green-50 text-green-700',
};

export function QuotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<QuoteCategory | 'All'>(
    'All'
  );

  const filteredQuotes = MOCK_QUOTES.filter((quote) => {
    const matchesSearch =
      quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || quote.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalQuotes = MOCK_QUOTES.length;
  const scheduledCount = MOCK_QUOTES.filter(
    (q) => q.status === 'Scheduled'
  ).length;
  const unscheduledCount = MOCK_QUOTES.filter(
    (q) => q.status === 'Unscheduled'
  ).length;
  const categoriesCount = new Set(MOCK_QUOTES.map((q) => q.category)).size;

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Daily Quotes
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage and schedule daily inspirational quotes for users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50">
            <Upload size={16} />
            Upload CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
            <Plus size={16} />
            Add Quote
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Quote size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {totalQuotes}
              </p>
              <p className="text-xs text-text-secondary">Total Quotes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {scheduledCount}
              </p>
              <p className="text-xs text-text-secondary">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Clock size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {unscheduledCount}
              </p>
              <p className="text-xs text-text-secondary">Unscheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Tag size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {categoriesCount}
              </p>
              <p className="text-xs text-text-secondary">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === 'All'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search quotes or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Quote
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Author
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {quote.date ?? '--'}
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <p className="text-sm italic text-text-primary">
                      &ldquo;{truncateText(quote.text, 70)}&rdquo;
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                    {quote.author}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {quote.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[quote.status]}`}
                    >
                      {quote.status === 'Delivered' && (
                        <CheckCircle size={11} />
                      )}
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Edit quote"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete quote"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Quote size={32} className="mb-3 text-gray-300" />
            <p className="text-sm text-text-secondary">
              No quotes match your search criteria.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-text-secondary">
            Showing {filteredQuotes.length} of {totalQuotes} quotes
          </p>
        </div>
      </div>
    </div>
  );
}
