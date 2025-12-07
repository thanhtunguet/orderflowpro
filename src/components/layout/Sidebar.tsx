import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders' },
  { icon: Users, label: 'Khách hàng', path: '/customers' },
  { icon: BarChart3, label: 'Báo cáo', path: '/reports' },
  { icon: Bell, label: 'Thông báo', path: '/notifications' },
  { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

export function Sidebar({ onLogout, userName = 'User', userRole = 'sales' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const roleLabels: Record<string, string> = {
    sales: 'Nhân viên Sales',
    unit_manager: 'Quản lý Đơn vị',
    general_manager: 'Quản lý Cấp cao',
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar z-40 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow">
                <ShoppingCart className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">OrderFlow</h1>
                <p className="text-xs text-sidebar-foreground/60">Quản lý đơn hàng</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 mx-auto rounded-xl gradient-accent flex items-center justify-center shadow-glow">
              <ShoppingCart className="h-5 w-5 text-accent-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive && "animate-pulse-soft")} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                <p className="text-xs text-sidebar-foreground/60">{roleLabels[userRole]}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "mt-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
              isCollapsed ? "w-full justify-center" : "w-full justify-start"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Đăng xuất</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
