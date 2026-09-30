import AppChrome from '@/components/AppChrome';
import { hoyFecha } from '@/lib/fecha';

export default function CoachLayout({ children }) {
  return (
    <AppChrome rol="coach" hoy={hoyFecha()}>
      {children}
    </AppChrome>
  );
}
