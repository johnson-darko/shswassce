import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, Settings, Bookmark } from "lucide-react";
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed

export default function BottomNavigation() {
  const location = useLocation();
  const { theme } = useTheme();
  const navItems = [
        { to: "/", label: "Home", icon: <Home /> },
  { to: "/saved-programs", label: "Saved", icon: <Bookmark /> },
    { to: "/calculator", label: "Aggregate", icon: <Calculator /> },
    { to: "/settings", label: "Settings", icon: <Settings /> },
  ];
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 border-t ${
        theme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center text-xs px-2 ${
            location.pathname === item.to
              ? theme === "dark"
                ? "text-yellow-300 font-bold"
                : "text-blue-600 font-bold"
              : theme === "dark"
                ? "text-gray-400"
                : "text-gray-500"
          }`}
        >
          <span className="h-6 w-6 mb-1">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}