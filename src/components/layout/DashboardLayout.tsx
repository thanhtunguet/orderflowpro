import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export function DashboardLayout({ children, onLogout, userName, userRole }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} userName={userName} userRole={userRole} />
      <main className="md:pl-64 min-h-screen">
        <div className="p-4 md:p-8 pt-20 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
