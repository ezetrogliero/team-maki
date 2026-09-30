import AppChrome from '@/components/AppChrome';
import { hoyFecha } from '@/lib/fecha';

export default function AlumnoLayout({ children }) {
  return (
    <AppChrome rol="alumno" hoy={hoyFecha()}>
      {children}
    </AppChrome>
  );
}
