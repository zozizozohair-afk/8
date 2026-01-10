import { supabase } from '@/lib/supabaseClient';
import ProjectClient from './ProjectClient';

export async function generateStaticParams() {
  const { data: projects } = await supabase.from('projects').select('id');
  
  if (!projects) return [];

  return projects.map(({ id }) => ({
    id: id.toString(),
  }));
}

export default function Page() {
  return <ProjectClient />;
}
