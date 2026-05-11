import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path 
        d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
        fill="url(#logo-gradient)" 
      />
      {/* Stylized A shape */}
      <path 
        d="M50 25L75 70H60L50 52L40 70H25L50 25Z" 
        fill="white" 
      />
      <path 
        d="M42 62H58V68H42V62Z" 
        fill="white" 
      />
    </svg>
  )
}
