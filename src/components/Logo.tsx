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
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="100%" stopColor="#0099CC" />
        </linearGradient>
      </defs>
      <rect 
        x="10" 
        y="10" 
        width="80" 
        height="80" 
        rx="20" 
        fill="url(#logo-gradient)" 
      />
      <path 
        d="M50 25L75 70H60L50 50L40 70H25L50 25Z" 
        fill="white" 
      />
      <rect 
        x="35" 
        y="58" 
        width="30" 
        height="5" 
        rx="2" 
        fill="white" 
      />
    </svg>
  )
}