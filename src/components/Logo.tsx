import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-10 h-10", className)}
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
      <path 
        d="M50 22L78 72H63L50 48L37 72H22L50 22Z" 
        fill="white" 
      />
      <path 
        d="M40 60H60V66H40V60Z" 
        fill="white" 
      />
    </svg>
  )
}