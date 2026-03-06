import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { Sparkles, Image as ImageIcon } from 'lucide-react'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-primary/30">
      <nav className="glass sticky top-0 z-50 w-full md:px-8 px-4 py-3 flex justify-between items-center transition-all duration-300">
        <Link to="/" className="text-xl font-heading font-bold flex items-center gap-2 hover:text-primary transition-colors">
          <Sparkles className="text-primary w-6 h-6" />
          <span>PreProc<span className="text-primary">ML</span></span>
        </Link>
        <div className="space-x-6 flex items-center font-medium">
          <Link to="/" className="hover:text-primary transition-colors text-sm uppercase tracking-wider hidden sm:block">Home</Link>
          <Link to="/image-processing" className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full transition-all flex items-center gap-2 text-sm uppercase tracking-wider font-semibold">
            <ImageIcon className="w-4 h-4" /> Try It
          </Link>
        </div>
      </nav>
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  )
}
