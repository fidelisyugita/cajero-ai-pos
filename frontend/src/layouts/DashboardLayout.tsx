import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";


/**
 * 
 * TODO
 * Impelement readable data for log
 * change report as Home / Dashboard (replace current since no need do transaction)
 * Implement ingredient
 */

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth(); // Assuming user object is available
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Point of Sale", icon: Store },
    { href: "/transactions", label: "Transactions", icon: ShoppingCart },
    { href: "/products", label: "Products", icon: ShoppingCart },
    { href: "/categories", label: "Categories", icon: ShoppingCart },
    { href: "/stock-history", label: "Stock History", icon: BarChart3 },
    { href: "/petty-cash", label: "Petty Cash", icon: BarChart3 },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/logs", label: "Logs", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-card/50 backdrop-blur-xl border-r z-30 flex flex-col transition-all duration-300">
        {/* Logo */}
        <div className="py-8 flex items-center justify-center border-b border-border/50">
           <img src="/logo.svg" alt="Cajero Logo" className="w-30 h-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-12 mb-1 text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-border/50 bg-card/30">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="h-20 sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b flex items-center justify-between px-8 transition-all duration-300">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Trigger (Hidden on Desktop) */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-semibold tracking-tight">
               {navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-border/50">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold leading-none">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Administrator
                </p>
              </div>
              <Button
                variant="ghost"
                className="rounded-full h-10 w-10 p-0 overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors"
              >
                  <div className="h-full w-full bg-secondary flex items-center justify-center text-secondary-foreground">
                      <User className="h-5 w-5" />
                  </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 bg-muted/20">
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
