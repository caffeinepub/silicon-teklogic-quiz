interface HeaderProps {
  showNavigation?: boolean;
}

export function Header({ showNavigation = false }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/uploads/Screenshot-2026-02-08-145647-1.png" 
            alt="VLSI Logo" 
            className="h-12 w-12 rounded-full object-contain"
          />
          <h1 className="text-xl font-bold md:text-2xl">
            <span className="text-accent">SI</span>licon{' '}
            <span className="text-accent">TE</span>klogic Conclave
          </h1>
        </div>
        {showNavigation && (
          <nav className="hidden items-center gap-4 md:flex">
            <a href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </a>
            <a href="/register" className="text-sm font-medium transition-colors hover:text-primary">
              Register
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
