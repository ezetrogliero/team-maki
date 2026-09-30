'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav({ rol, hoy }) {
  const pathname = usePathname() || '';

  const tabs =
    rol === 'coach'
      ? [
          { href: `/coach/dia/${hoy}`, label: 'Hoy', activo: pathname.startsWith('/coach/dia') || pathname === '/coach' },
          { href: `/ranking/${hoy}`, label: 'Ranking', activo: pathname.startsWith('/ranking') },
          { href: '/coach/alumnos', label: 'Alumnos', activo: pathname.startsWith('/coach/alumnos') },
        ]
      : [
          { href: `/alumno/dia/${hoy}`, label: 'Hoy', activo: pathname.startsWith('/alumno/dia') || pathname === '/alumno' },
          { href: `/ranking/${hoy}`, label: 'Ranking', activo: pathname.startsWith('/ranking') },
          { href: '/alumno/progreso', label: 'Mi progreso', activo: pathname.startsWith('/alumno/progreso') },
        ];

  return (
    <nav className="nav" aria-label="Secciones">
      <div className="in">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} aria-current={t.activo ? 'page' : undefined}>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
