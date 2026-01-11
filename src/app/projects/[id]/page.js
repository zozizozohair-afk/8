import { createClient } from '@supabase/supabase-js';
import ProjectClient from './ProjectClient';

// Force dynamic rendering during development to avoid static generation errors
export const dynamicParams = true; 

export async function generateStaticParams() {
  // In development, we can return an empty array or just the specific ID being accessed if possible.
  // But generateStaticParams is mainly for build time.
  // When output: 'export' is used, Next.js tries to be strict.
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: projects } = await supabase.from('projects').select('id');
    
    if (!projects) return [];

    return projects.map(({ id }) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export default function Page({ params }) {
  // Pass params directly to ensure client component gets them correctly if needed,
  // though useParams hook handles it too.
  return <ProjectClient id={params.id} />;
}
