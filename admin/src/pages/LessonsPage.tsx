/**
 * File: LessonsPage.tsx
 *
 * Description: Lesson management page nested under courses with media upload and reordering.
 *
 * Author: Navnit(Ninjacode911)
 */

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  GripVertical,
  Play,
  ChevronDown,
  Clock,
  FileText,
} from 'lucide-react';

type LessonType =
  | 'guided_meditation'
  | 'breathing_exercise'
  | 'body_scan'
  | 'theory'
  | 'chanting';
type LessonStatus = 'Published' | 'Draft';

interface Lesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  type: LessonType;
  status: LessonStatus;
  hasPreview: boolean;
}

interface CourseOption {
  id: string;
  title: string;
}

const COURSE_OPTIONS: CourseOption[] = [
  { id: 'c1', title: 'Foundations of Meditation' },
  { id: 'c2', title: 'Pranayama Art of Breath' },
  { id: 'c3', title: 'Deep Sleep Yoga Nidra' },
  { id: 'c4', title: 'Vedic Chanting' },
  { id: 'c5', title: 'Advanced Vipassana' },
];

const MOCK_LESSONS: Record<string, Lesson[]> = {
  c1: [
    { id: 'l1', order: 1, title: 'What is Meditation?', duration: '8:30', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l2', order: 2, title: 'Finding Your Posture', duration: '6:15', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l3', order: 3, title: 'Breath Awareness', duration: '12:00', type: 'guided_meditation', status: 'Published', hasPreview: false },
    { id: 'l4', order: 4, title: 'Body Scan Relaxation', duration: '15:45', type: 'body_scan', status: 'Published', hasPreview: true },
    { id: 'l5', order: 5, title: 'Mindful Breathing Basics', duration: '10:00', type: 'breathing_exercise', status: 'Published', hasPreview: false },
    { id: 'l6', order: 6, title: 'Dealing with Distractions', duration: '9:20', type: 'guided_meditation', status: 'Draft', hasPreview: false },
    { id: 'l7', order: 7, title: 'Loving Kindness Meditation', duration: '14:30', type: 'guided_meditation', status: 'Published', hasPreview: true },
    { id: 'l8', order: 8, title: 'Building a Daily Practice', duration: '7:45', type: 'theory', status: 'Draft', hasPreview: false },
  ],
  c2: [
    { id: 'l9', order: 1, title: 'Introduction to Pranayama', duration: '10:00', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l10', order: 2, title: 'Nadi Shodhana', duration: '12:30', type: 'breathing_exercise', status: 'Published', hasPreview: true },
    { id: 'l11', order: 3, title: 'Kapalabhati', duration: '8:45', type: 'breathing_exercise', status: 'Draft', hasPreview: false },
  ],
  c3: [
    { id: 'l12', order: 1, title: 'What is Yoga Nidra?', duration: '6:00', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l13', order: 2, title: 'Progressive Relaxation', duration: '20:00', type: 'body_scan', status: 'Published', hasPreview: false },
  ],
  c4: [
    { id: 'l14', order: 1, title: 'Sanskrit Pronunciation', duration: '11:00', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l15', order: 2, title: 'Om Chanting Practice', duration: '15:00', type: 'chanting', status: 'Draft', hasPreview: false },
  ],
  c5: [
    { id: 'l16', order: 1, title: 'Vipassana Origins', duration: '9:30', type: 'theory', status: 'Published', hasPreview: true },
    { id: 'l17', order: 2, title: 'Anapana Sati', duration: '25:00', type: 'guided_meditation', status: 'Published', hasPreview: false },
  ],
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  guided_meditation: 'Guided Meditation',
  breathing_exercise: 'Breathing Exercise',
  body_scan: 'Body Scan',
  theory: 'Theory',
  chanting: 'Chanting',
};

const LESSON_TYPE_STYLES: Record<LessonType, string> = {
  guided_meditation: 'bg-purple-50 text-purple-700',
  breathing_exercise: 'bg-blue-50 text-blue-700',
  body_scan: 'bg-teal-50 text-teal-700',
  theory: 'bg-amber-50 text-amber-700',
  chanting: 'bg-pink-50 text-pink-700',
};

const STATUS_STYLES: Record<LessonStatus, string> = {
  Published: 'bg-green-50 text-green-700',
  Draft: 'bg-gray-100 text-gray-600',
};

export function LessonsPage() {
  const [selectedCourse, setSelectedCourse] = useState('c1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const lessons = MOCK_LESSONS[selectedCourse] ?? [];
  const selectedCourseTitle =
    COURSE_OPTIONS.find((c) => c.id === selectedCourse)?.title ?? '';

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Lesson Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Organize and manage lesson content for each course
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Add Lesson
        </button>
      </div>

      {/* Course Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowCourseDropdown(!showCourseDropdown)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-surface px-5 py-3.5 shadow-sm transition-colors hover:border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Viewing lessons for
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {selectedCourseTitle}
              </p>
            </div>
          </div>
          <ChevronDown size={18} className="text-text-secondary" />
        </button>
        {showCourseDropdown && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            {COURSE_OPTIONS.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course.id);
                  setShowCourseDropdown(false);
                  setSearchQuery('');
                }}
                className={`block w-full px-5 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                  selectedCourse === course.id
                    ? 'font-semibold text-primary'
                    : 'text-text-primary'
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
          <p className="text-sm text-text-secondary">
            {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  #
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Duration
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Preview
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-3 py-4">
                    <GripVertical
                      size={16}
                      className="cursor-grab text-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-text-secondary">
                    {lesson.order}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-text-primary">
                    {lesson.title}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Clock size={13} />
                      {lesson.duration}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${LESSON_TYPE_STYLES[lesson.type]}`}
                    >
                      {LESSON_TYPE_LABELS[lesson.type]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[lesson.status]}`}
                    >
                      {lesson.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {lesson.hasPreview ? (
                      <button className="flex items-center gap-1 rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10">
                        <Play size={14} />
                      </button>
                    ) : (
                      <span className="text-xs text-text-secondary">--</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Edit lesson"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete lesson"
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

        {filteredLessons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText size={32} className="mb-3 text-gray-300" />
            <p className="text-sm text-text-secondary">
              No lessons found for this course.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
