import { Outlet } from '@tanstack/react-router'
import Particles from '../components/ui/Particles'

export default function AuthLayout() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 min-h-screen relative isolate">
      {/* Particles background */}
      <div className="absolute inset-0 -z-20 opacity-90 dark:opacity-70 overflow-hidden">
        <Particles
          particleCount={150}
          particleSpread={20}
          speed={0.05}
          particleBaseSize={300}
          alphaParticles={true}
          disableRotation={false}
          useThemeColor={true}
          moveParticlesOnHover={true}
          particleHoverFactor={0.8}
        />
      </div>
      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  )
}
