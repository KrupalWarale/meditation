/**
 * File: CoursesPage.tsx
 *
 * Description: Course management page with CRUD operations, publish/unpublish toggle,
 * and data table.
 *
 * Author: Navnit(Ninjacode911)
 */

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

type CourseStatus = 'Published' | 'Draft' | 'Archived';
type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Course {
  id: string;
  title: string;
  instructor: string;
  difficulty: CourseDifficulty;
  lessons: number;
  enrollments: number;
  status: CourseStatus;
}

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Foundations of Meditation',
    instructor: 'Gurudev Sri Sri',
    difficulty: 'Beginner',
    lessons: 12,
    enrollments: 1248,
    status: 'Published',
  },
  {
    id: 'c2',
    title: 'Pranayama Art of Breath',
    instructor: 'Swami Purnachaitanya',
    difficulty: 'Intermediate',
    lessons: 8,
    enrollments: 876,
    status: 'Published',
  },
  {
    id: 'c3',
    title: 'Deep Sleep Yoga Nidra',
    instructor: 'Dinesh Ghodke',
    difficulty: 'Beginner',
    lessons: 6,
    enrollments: 2034,
    status: 'Published',
  },
  {
    id: 'c4',
    title: 'Vedic Chanting',
    instructor: 'Rishi Vidyadhar',
    difficulty: 'Intermediate',
    lessons: 10,
    enrollments: 342,
    status: 'Draft',
  },
  {
    id: 'c5',
    title: 'Advanced Vipassana',
    instructor: 'Acharya Prashant',
    difficulty: 'Advanced',
    lessons: 15,
    enrollments: 189,
    status: 'Archived',
  },
];

const STATUS_STYLES: Record<CourseStatus, string> = {
  Published: 'bg-green-50 text-green-700',
  Draft: 'bg-gray-100 text-gray-600',
  Archived: 'bg-red-50 text-red-600',
};

const DIFFICULTY_STYLES: Record<CourseDifficulty, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-yellow-50 text-yellow-700',
  Advanced: 'bg-red-50 text-red-600',
};

const STATUS_OPTIONS: CourseStatus[] = ['Published', 'Draft', 'Archived'];

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'All'>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Course Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Create, edit, and manage meditation courses and their content
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Add Course
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50"
            >
              <Filter size={16} />
              {statusFilter === 'All' ? 'All Status' : statusFilter}
              <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setShowFilterDropdown(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50"
                >
                  All Status
                </button>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-50"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Title
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Instructor
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Lessons
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Enrollments
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
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen size={16} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {course.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[course.difficulty]}`}
                    >
                      {course.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {course.lessons}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">
                    {course.enrollments.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[course.status]}`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Edit course"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete course"
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

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-text-secondary">
            Showing {filteredCourses.length} of {MOCK_COURSES.length} courses
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-white bg-primary">
              1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
