import { createClient } from '@/lib/supabase/server';
import { HomeContent } from './home-content';

export default async function HomePage() {
  let colleges: any[] = [];
  let courses: any[] = [];
  let collegeCount = 0;
  let courseCount = 0;

  try {
    const supabase = await createClient();
    const [collegesRes, coursesRes] = await Promise.all([
      supabase.from('colleges').select('*', { count: 'exact' }).limit(6),
      supabase.from('institute_courses').select('*', { count: 'exact' }),
    ]);
    colleges = collegesRes.data ?? [];
    courses = coursesRes.data ?? [];
    collegeCount = collegesRes.count ?? colleges.length;
    courseCount = coursesRes.count ?? courses.length;
  } catch {
    // Supabase not configured — render with empty data
  }

  return (
    <HomeContent
      colleges={colleges}
      courses={courses}
      collegeCount={collegeCount}
      courseCount={courseCount}
    />
  );
}
