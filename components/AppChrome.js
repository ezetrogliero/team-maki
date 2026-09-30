'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';

// Envuelve todas las pantallas de /alumno y /coach con el header y la barra
// de navegación inferior (igual que la maqueta), menos el onboarding, que es
// una pantalla propia sin esos elementos.
export default function AppChrome({ rol, hoy, children }) {
  const pathname = usePathname() || '';
  const sinChrome = pathname.includes('/onboarding');

  if (sinChrome) return <>{children}</>;

  return (
    <div className="shell" style={{ paddingBottom: 84 }}>
      <Header />
      {children}
      <BottomNav rol={rol} hoy={hoy} />
    </div>
  );
}
