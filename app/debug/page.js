import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Debug() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let profileResult = null;
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, rol, activo')
      .eq('id', user.id)
      .maybeSingle();
    profileResult = { data, error: error?.message || null };
  }

  return (
    <main style={{ padding: 24, fontFamily: 'monospace', fontSize: 13, background: '#fff', color: '#000' }}>
      <h1>Debug</h1>
      <h3>Usuario (auth.getUser)</h3>
      <pre>{JSON.stringify({ user: user ? { id: user.id, email: user.email } : null, userError: userError?.message || null }, null, 2)}</pre>
      <h3>Perfil (select en profiles)</h3>
      <pre>{JSON.stringify(profileResult, null, 2)}</pre>
    </main>
  );
}
