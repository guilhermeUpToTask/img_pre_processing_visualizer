import { createFileRoute, Link } from '@tanstack/react-router'
import { Brain, Layers, Filter, Maximize, ArrowRight, Activity, Droplets } from 'lucide-react'

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-24 sm:pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-muted border border-primary/20 text-primary text-sm font-medium mb-8">
            <Droplets className="w-4 h-4" aria-hidden />
            <span>Interactive Computer Vision</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-text leading-[1.1] tracking-tight mb-6">
            Master Image{' '}
            <span className="text-ocean-gradient">Pre-Processing</span>{' '}
            for ML
          </h1>

          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed">
            Transform raw pixels into model-ready tensors. Learn why scaling, cropping, and contrast enhancement are essential for neural network accuracy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/image-processing"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Start Processing <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
            <a
              href="#learn-more"
              className="inline-flex items-center justify-center gap-2 font-semibold text-text bg-surface border border-border rounded-xl px-6 py-3 hover:bg-surface-elevated hover:border-border-strong transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="learn-more" className="border-t border-border bg-surface/50 py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text mb-4">
              Why Pre-Process Data?
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto text-base sm:text-lg">
              Raw images are chaotic. Pre-processing turns them into clean tensors that deep learning models can reliably learn from.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Filter className="w-7 h-7 text-primary" aria-hidden />}
              title="Noise Reduction"
              description="Removes high-frequency artifacts so models focus on true structural patterns, not camera imperfections."
            />
            <FeatureCard
              icon={<Layers className="w-7 h-7 text-primary" aria-hidden />}
              title="Dimensionality"
              description="Grayscale and resizing reduce the feature space, speeding up training significantly."
            />
            <FeatureCard
              icon={<Activity className="w-7 h-7 text-primary" aria-hidden />}
              title="Normalization"
              description="Rescaling pixel values to 0–1 stabilizes gradients during backpropagation."
            />
            <FeatureCard
              icon={<Maximize className="w-7 h-7 text-primary" aria-hidden />}
              title="Contrast Enhancement"
              description="CLAHE and histogram equalization reveal hidden shapes in low-light conditions."
            />
            <FeatureCard
              icon={<Brain className="w-7 h-7 text-primary" aria-hidden />}
              title="Model Robustness"
              description="Consistent pre-processing ensures models generalize well to new, unseen data."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card-ocean-elevated p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-black/5 transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary-muted border border-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-lg text-text">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  )
}
