import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserPlus } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <img 
              src="/assets/uploads/Screenshot-2026-02-08-145647-1.png" 
              alt="VLSI Logo" 
              className="h-16 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-red-600">SI</span>licon{' '}
              <span className="text-red-600">TE</span>klogic Conclave
            </h1>
            <p className="text-xl text-muted-foreground">
              Technical Quiz Competition 2026
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Admin Card */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Admin Access</CardTitle>
                <CardDescription>
                  Manage questions, whitelist participants, and view results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button className="w-full h-12 text-base" size="lg">
                    Admin Login
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Participant Card */}
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <UserPlus className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Participant Entry</CardTitle>
                <CardDescription>
                  Register and take the technical quiz competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/register">
                  <Button className="w-full h-12 text-base" variant="secondary" size="lg">
                    Register for Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">20</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">30</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">200+</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>
          © 2026. Built with ❤️ using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
