import { Link, useLocation } from "react-router-dom";
import { BookOpen, FileText, BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Trang chủ", path: "/", icon: Home },
  { title: "Luyện đọc", path: "/read", icon: BookOpen },
  { title: "Đơn giản hóa", path: "/simplify", icon: FileText },
  { title: "Tiến trình", path: "/dashboard", icon: BarChart3 },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground rounded-full p-2 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DyslexiAid
            </span>
          </Link>

          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
