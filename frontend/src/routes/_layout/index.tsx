import { createFileRoute, Link } from '@tanstack/react-router'
import { Brain, Layers, Filter, Maximize, ArrowRight, Activity, Zap } from 'lucide-react'

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="w-full flex-col flex items-center justify-center pb-24 overflow-hidden relative">
      {/* Background Decorators */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6 animate-in slide-in-from-bottom-4 duration-500">
          <Zap className="w-4 h-4" />
          <span>Interactive Computer Vision Learning</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-in slide-in-from-bottom-6 duration-700">
          Master Image <br className="hidden md:block" />
          <span className="text-gradient">Pre-Processing</span> for ML
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 animate-in slide-in-from-bottom-8 duration-1000">
          Before a Neural Network can understand an image, the data must be prepared.
          Learn why operations like scaling, cropping, and contrast enhancement are crucial for model accuracy.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1000 delay-300">
          <Link 
            to="/image-processing" 
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1"
          >
            Start Processing <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#learn-more" 
            className="flex items-center justify-center gap-2 glass px-8 py-4 rounded-full font-semibold text-lg hover:bg-glass-bg/80 transition-all font-heading"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Educational Features Section */}
      <section id="learn-more" className="max-w-6xl mx-auto px-6 py-20 w-full relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Why Pre-Process Data?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Raw images are chaotic and full of noise. Pre-processing transforms them into mathematical tensors that Deep Learning models can reliably digest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Filter className="w-8 h-8 text-primary" />}
            title="Noise Reduction"
            description="Removes high-frequency artifacts (noise) so models focus on true structural patterns rather than camera imperfections."
          />
          <FeatureCard 
            icon={<Layers className="w-8 h-8 text-accent" />}
            title="Dimensionality"
            description="Grayscale conversion and resizing reduce the feature space, significantly speeding up training."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-green-400" />}
            title="Normalization"
            description="Rescaling pixel values between 0 and 1 stabilizes gradients during backpropagation."
          />
          <FeatureCard 
            icon={<Maximize className="w-8 h-8 text-blue-400" />}
            title="Contrast Enhancement"
            description="Techniques like CLAHE equalize histograms to reveal hidden shapes in low-light conditions."
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-purple-400" />}
            title="Model Robustness"
            description="Applying consistent pre-processing ensures the model generalizes well to new, unseen data in production."
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="p-3 bg-white/5 rounded-xl w-fit border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-heading">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
