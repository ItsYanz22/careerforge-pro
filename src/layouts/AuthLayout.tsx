import { Outlet } from '@tanstack/react-router'

export default function AuthLayout() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12 min-h-screen">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
