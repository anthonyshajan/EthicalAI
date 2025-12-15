
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Upload, 
  FileSearch,
  History,
  Shield,
  BookOpen,
  LogOut,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Ask AI",
    url: createPageUrl("Home"),
    icon: BookOpen,
    description: "Get help with anything"
  },
  {
    title: "Check for AI",
    url: createPageUrl("CheckWork"),
    icon: Shield,
    description: "See if work looks AI-made"
  },
  {
    title: "Get Assignment Feedback",
    url: createPageUrl("Upload"),
    icon: Upload,
    description: "Upload & get guidance"
  },
  {
    title: "My Work",
    url: createPageUrl("Dashboard"),
    icon: FileSearch,
    description: "See past submissions"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --text-primary: #111827;
            --text-secondary: #6b7280;
            --bg-primary: #ffffff;
            --bg-secondary: #f9fafb;
            --border: #e5e7eb;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  EthicalAI
                </h2>
                <p className="text-xs text-gray-500">
                  Academic Integrity Platform
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-gray-500">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url 
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div>
                            <span className="font-medium text-sm">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-gray-500">
                Our Commitment
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Academic Honesty First
                    </span>
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">
                    We guide, not complete. Every suggestion is transparent 
                    and designed to help you learn and improve your own work.
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900">
                      {user.full_name || 'Student'}
                    </p>
                    <p className="text-xs truncate text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-semibold text-gray-900">
                EthicalAI
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-gray-50">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
