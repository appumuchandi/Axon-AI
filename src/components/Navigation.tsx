"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, User, ShieldAlert, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "AI Assistant", icon: MessageSquare, href: "/assistant" },
    { label: "SOS", icon: ShieldAlert, href: "/sos", highlight: true },
    { label: "Profile", icon: User, href: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t h-16 md:h-20 px-4">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                item.highlight && "text-accent"
              )}
            >
              <div className={cn(
                "p-2 rounded-full",
                isActive && "bg-primary/10",
                item.highlight && isActive && "bg-accent/10"
              )}>
                <Icon className={cn("h-6 w-6", item.highlight && "animate-pulse")} />
              </div>
              <span className="text-[10px] md:text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}