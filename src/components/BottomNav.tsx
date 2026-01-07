import { Home, BarChart2, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive("/") ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/")}
        >
          <Home size={22} />
          <span className="text-xs">Home</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive("/stats") ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/stats")}
        >
          <BarChart2 size={22} />
          <span className="text-xs">Stats</span>
        </button>
        <button
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive("/settings") ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={22} />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
