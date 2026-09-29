import Link from 'next/link';

export default function Header({ homeHref = '/' }) {
  return (
    <header className="top">
      <Link href={homeHref} className="brand">
        <img src="/logo.png" alt="Team Maki" className="brandmark" />
        <div className="brandtext">
          <span className="logo">
            TEAM <span>MAKI</span>
          </span>
        </div>
      </Link>
      <form action="/logout" method="post">
        <button type="submit" className="btn ghost sm">Salir</button>
      </form>
    </header>
  );
}
