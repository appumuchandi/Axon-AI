"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, ShieldAlert, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { label: "Dash", icon: LayoutDashboard, href: "/dashboard" },
    { label: "AI Assist", icon: MessageSquare, href: "/assistant" },
    { label: "SOS", icon: ShieldAlert, href: "/sos", highlight: true },
    { label: "Identity", icon: User, href: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t h-16 md:h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary",
                item.highlight && !isActive && "text-accent",
                item.highlight && isActive && "text-accent scale-110"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive && "bg-primary/10",
                item.highlight && !isActive && "bg-accent/5",
                item.highlight && isActive && "bg-accent/15"
              )}>
                <Icon className={cn("h-6 w-6", item.highlight && "animate-pulse")} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}