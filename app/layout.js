import './globals.css';

export const metadata = {
  title: 'Team Maki',
  description: 'Programación y seguimiento de entrenamientos — Team Maki',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
