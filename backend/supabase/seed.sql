-- =====================================================
-- MAA Meditation App — Seed Data
-- Development sample data: courses, lessons, quotes, events
-- Run AFTER all migrations (001-020) have been applied
-- =====================================================

-- =====================================================
-- COURSES (5 sample courses)
-- =====================================================

INSERT INTO courses (id, title, description, instructor_name, thumbnail_url, category, difficulty_level, estimated_duration_minutes, total_lessons, is_premium, status)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Foundations of Meditation',
    'A beginner-friendly introduction to meditation. Learn breathing techniques, posture, and how to quiet the mind in just 10 minutes a day.',
    'Swami Prakash',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'meditation',
    'beginner',
    120,
    8,
    false,
    'published'
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Pranayama: The Art of Breath',
    'Master ancient breathing techniques — Anulom Vilom, Kapalabhati, and Bhramari — to transform your energy and calm your nervous system.',
    'Dr. Meera Iyer',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    'pranayama',
    'intermediate',
    90,
    6,
    false,
    'published'
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'Deep Sleep & Yoga Nidra',
    'Guided yoga nidra sessions designed to help you achieve deep rest, overcome insomnia, and wake up fully rejuvenated.',
    'Ananya Sharma',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'yoga',
    'beginner',
    150,
    10,
    true,
    'published'
  ),
  (
    'a1b2c3d4-0004-0004-0004-000000000004',
    'Vedic Chanting for Inner Peace',
    'Learn to chant powerful Vedic mantras including the Gayatri Mantra, Mahamrityunjaya, and Om Namah Shivaya with correct pronunciation.',
    'Pandit Raghavendra',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'chanting',
    'beginner',
    200,
    12,
    true,
    'published'
  ),
  (
    'a1b2c3d4-0005-0005-0005-000000000005',
    'Advanced Vipassana Techniques',
    'For experienced meditators. Explore body scanning, insight meditation, and silent retreat practices used in traditional Vipassana.',
    'Guru Ananda',
    'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=800',
    'meditation',
    'advanced',
    300,
    15,
    true,
    'published'
  )
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- LESSONS (sample lessons for Course 1 — Foundations)
-- =====================================================

INSERT INTO lessons (id, course_id, title, description, audio_url, duration_minutes, lesson_number, is_preview)
VALUES
  ('b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'What is Meditation?', 'An introduction to the science and philosophy of meditation and its benefits.', 'https://example.com/media/lesson1.mp3', 8, 1, true),
  ('b1b2c3d4-0002-0002-0002-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Finding Your Posture', 'Learn sitting postures, how to use cushions, and how to keep your spine aligned.', 'https://example.com/media/lesson2.mp3', 9, 2, true),
  ('b1b2c3d4-0003-0003-0003-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Basic Breath Awareness', 'Guided session: observe the breath without control. The foundation of all meditation.', 'https://example.com/media/lesson3.mp3', 10, 3, false),
  ('b1b2c3d4-0004-0004-0004-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Dealing with Thoughts', 'Why thoughts arise during meditation and the correct way to handle them.', 'https://example.com/media/lesson4.mp3', 7, 4, false),
  ('b1b2c3d4-0005-0005-0005-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', '10-Minute Morning Practice', 'A complete guided morning meditation to start every day with clarity and calm.', 'https://example.com/media/lesson5.mp3', 10, 5, false),
  ('b1b2c3d4-0006-0006-0006-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Loving Kindness (Metta)', 'Learn the Metta meditation — cultivating compassion for yourself and others.', 'https://example.com/media/lesson6.mp3', 12, 6, false),
  ('b1b2c3d4-0007-0007-0007-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Meditation for Stress', 'A targeted session for releasing stress and anxiety held in the body.', 'https://example.com/media/lesson7.mp3', 11, 7, false),
  ('b1b2c3d4-0008-0008-0008-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Building Your Daily Habit', 'Strategies, reminders, and accountability techniques to meditate consistently.', 'https://example.com/media/lesson8.mp3', 8, 8, false)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- DAILY QUOTES (30 sample quotes)
-- =====================================================

INSERT INTO daily_quotes (quote_text, author, source, quote_date, category, language)
VALUES
  ('The present moment is the only moment available to us, and it is the door to all moments.', 'Thich Nhat Hanh', NULL, CURRENT_DATE + 0, 'mindfulness', 'en'),
  ('In the middle of difficulty lies opportunity.', 'Albert Einstein', NULL, CURRENT_DATE + 1, 'courage', 'en'),
  ('You have power over your mind, not outside events. Realize this and you will find strength.', 'Marcus Aurelius', 'Meditations', CURRENT_DATE + 2, 'wisdom', 'en'),
  ('Peace comes from within. Do not seek it without.', 'Gautama Buddha', NULL, CURRENT_DATE + 3, 'spirituality', 'en'),
  ('The soul always knows what to do to heal itself. The challenge is to silence the mind.', 'Caroline Myss', NULL, CURRENT_DATE + 4, 'spirituality', 'en'),
  ('Wherever you are, be there totally.', 'Eckhart Tolle', 'The Power of Now', CURRENT_DATE + 5, 'mindfulness', 'en'),
  ('Happiness is not something ready made. It comes from your own actions.', 'Dalai Lama', NULL, CURRENT_DATE + 6, 'wisdom', 'en'),
  ('The quieter you become, the more you are able to hear.', 'Rumi', NULL, CURRENT_DATE + 7, 'meditation', 'en'),
  ('Do not dwell in the past, do not dream of the future. Concentrate the mind on the present moment.', 'Buddha', NULL, CURRENT_DATE + 8, 'mindfulness', 'en'),
  ('Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.', 'Rumi', NULL, CURRENT_DATE + 9, 'love', 'en'),
  ('The mind is everything. What you think you become.', 'Buddha', NULL, CURRENT_DATE + 10, 'wisdom', 'en'),
  ('Gratitude is the healthiest of all human emotions.', 'Zig Ziglar', NULL, CURRENT_DATE + 11, 'gratitude', 'en'),
  ('Breathe. You are alive.', 'Thich Nhat Hanh', NULL, CURRENT_DATE + 12, 'mindfulness', 'en'),
  ('In stillness, the world is restored.', 'Laozi', 'Tao Te Ching', CURRENT_DATE + 13, 'meditation', 'en'),
  ('Let the soft animal of your body love what it loves.', 'Mary Oliver', NULL, CURRENT_DATE + 14, 'love', 'en'),
  ('Be still and know.', 'Psalms 46:10', 'Bible', CURRENT_DATE + 15, 'spirituality', 'en'),
  ('What you seek is seeking you.', 'Rumi', NULL, CURRENT_DATE + 16, 'spirituality', 'en'),
  ('The longest journey is the journey inward.', 'Dag Hammarskjold', NULL, CURRENT_DATE + 17, 'meditation', 'en'),
  ('Courage is grace under pressure.', 'Ernest Hemingway', NULL, CURRENT_DATE + 18, 'courage', 'en'),
  ('Lokah Samastah Sukhino Bhavantu — May all beings everywhere be happy and free.', 'Sanskrit Mantra', NULL, CURRENT_DATE + 19, 'spirituality', 'en'),
  ('The greatest medicine is the void between thoughts.', 'Swami Vivekananda', NULL, CURRENT_DATE + 20, 'meditation', 'en'),
  ('Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.', 'Melody Beattie', NULL, CURRENT_DATE + 21, 'gratitude', 'en'),
  ('When you realize there is nothing lacking, the whole world belongs to you.', 'Laozi', 'Tao Te Ching', CURRENT_DATE + 22, 'wisdom', 'en'),
  ('The only way out is in.', 'Joseph Campbell', NULL, CURRENT_DATE + 23, 'spirituality', 'en'),
  ('Meditate. Live purely. Be quiet. Do your work with mastery.', 'Buddha', NULL, CURRENT_DATE + 24, 'meditation', 'en'),
  ('Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.', 'Zen Proverb', NULL, CURRENT_DATE + 25, 'wisdom', 'en'),
  ('The heart is the hub of all sacred places. Go there and roam.', 'Bhagawan Nityananda', NULL, CURRENT_DATE + 26, 'spirituality', 'en'),
  ('Be thankful for what you have; you''ll end up having more.', 'Oprah Winfrey', NULL, CURRENT_DATE + 27, 'gratitude', 'en'),
  ('Real courage is when you know you''re licked before you begin, but you begin anyway.', 'Harper Lee', 'To Kill a Mockingbird', CURRENT_DATE + 28, 'courage', 'en'),
  ('Tat Tvam Asi — That thou art.', 'Chandogya Upanishad', 'Upanishads', CURRENT_DATE + 29, 'spirituality', 'en')
ON CONFLICT DO NOTHING;


-- =====================================================
-- EVENTS (3 upcoming live events)
-- =====================================================

INSERT INTO events (id, title, description, instructor_name, event_date, duration_minutes, category, is_premium, status, thumbnail_url)
VALUES
  (
    'c1b2c3d4-0001-0001-0001-000000000001',
    'Full Moon Meditation Circle',
    'Join us for a powerful group meditation under the full moon. We will practice silence, guided visualisation, and mantra chanting. All levels welcome.',
    'Swami Prakash',
    NOW() + INTERVAL '3 days',
    90,
    'meditation',
    false,
    'upcoming',
    'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800'
  ),
  (
    'c1b2c3d4-0002-0002-0002-000000000002',
    'Stress-Free Living: A Satsang',
    'An interactive satsang exploring the Vedantic approach to stress, anxiety, and modern living. Includes Q&A with Guru Ananda.',
    'Guru Ananda',
    NOW() + INTERVAL '7 days',
    120,
    'satsang',
    false,
    'upcoming',
    'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=800'
  ),
  (
    'c1b2c3d4-0003-0003-0003-000000000003',
    'Advanced Pranayama Masterclass',
    'A premium deep-dive into Kumbhaka (breath retention), Bhastrika, and Surya Bhedana techniques. Suitable for practitioners with 6+ months experience.',
    'Dr. Meera Iyer',
    NOW() + INTERVAL '14 days',
    150,
    'pranayama',
    true,
    'upcoming',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
  )
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- CONTENT DIRECTORY (sample bhajans, meditations, satsangs)
-- =====================================================

INSERT INTO content_directory (title, description, instructor_name, media_url, thumbnail_url, duration_seconds, category, tags, language, is_premium)
VALUES
  ('Om Namah Shivaya — Full Chant', 'A 15-minute continuous chanting of Om Namah Shivaya, perfect for morning or evening practice.', 'Pandit Raghavendra', 'https://example.com/content/om-namah-shivaya.mp3', NULL, 900, 'chanting', ARRAY['shiva', 'mantra', 'morning', 'beginner'], 'hi', false),
  ('Gayatri Mantra — 108 Times', 'The sacred Gayatri Mantra chanted 108 times. Known to purify the mind and awaken higher consciousness.', 'Pandit Raghavendra', 'https://example.com/content/gayatri-108.mp3', NULL, 1800, 'chanting', ARRAY['gayatri', 'vedic', 'mantra', 'purification'], 'sa', false),
  ('Body Scan Meditation (20 min)', 'A guided body scan to release tension held in muscles and arrive fully in the present moment.', 'Ananya Sharma', 'https://example.com/content/body-scan.mp3', NULL, 1200, 'meditation', ARRAY['body scan', 'relaxation', 'beginner'], 'en', false),
  ('Hanuman Chalisa — Devotional', 'The complete Hanuman Chalisa, sung in a devotional style with instrumental accompaniment.', 'Bhajan Group MAA', 'https://example.com/content/hanuman-chalisa.mp3', NULL, 780, 'bhajan', ARRAY['hanuman', 'bhajan', 'devotion', 'hindi'], 'hi', false),
  ('Who Am I? — Ramana Maharshi Satsang', 'An audio exploration of Ramana Maharshi''s Self-inquiry method — the path of Jnana Yoga.', 'Guru Ananda', 'https://example.com/content/who-am-i.mp3', NULL, 2400, 'satsang', ARRAY['self-inquiry', 'vedanta', 'advanced', 'jnana'], 'en', true),
  ('Sleep Bhajan — Peaceful Night', 'Soft bhajans composed to ease the mind into restful sleep. Best listened to with eyes closed.', 'Bhajan Group MAA', 'https://example.com/content/sleep-bhajan.mp3', NULL, 3600, 'bhajan', ARRAY['sleep', 'night', 'relaxation', 'soft'], 'hi', false)
ON CONFLICT DO NOTHING;
