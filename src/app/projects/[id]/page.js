import { createClient } from '@supabase/supabase-js';
import ProjectClient from './ProjectClient';

// When using output: 'export', dynamicParams must be false.
// But for dev mode, we want to allow dynamic params to avoid 404s on new content.
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing during build');
      return []; 
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: projects, error } = await supabase.from('projects').select('id');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (projects && projects.length > 0) {
      console.log(`Generated params for ${projects.length} projects`);
      return projects.map(({ id }) => ({
        id: id.toString(),
      }));
    }
  } catch (e) {
    console.error('Error generating static params:', e);
  }

  // Fallback: return empty array so build succeeds, but no project pages will be generated.
  return [];
}

export default function Page({ params }) {
  return <ProjectClient id={params.id} />;
}
