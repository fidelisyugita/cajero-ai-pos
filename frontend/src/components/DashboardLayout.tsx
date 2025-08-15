import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Cajero POS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link to="/">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/" ? "bg-accent" : ""
                    }`}
                  >
                    <Store className="mr-2 h-5 w-5" />
                    Point of Sale
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/orders">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/orders" ? "bg-accent" : ""
                    }`}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Orders
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/reports">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/reports" ? "bg-accent" : ""
                    }`}
                  >
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Reports
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/settings" ? "bg-accent" : ""
                    }`}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center px-6">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
