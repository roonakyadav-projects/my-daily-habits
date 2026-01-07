import { Home, BarChart2, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <button
          className={`nav-button ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <Home size={22} />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          className={`nav-button ${isActive("/stats") ? "active" : ""}`}
          onClick={() => navigate("/stats")}
        >
          <BarChart2 size={22} />
          <span className="text-xs font-medium">Stats</span>
        </button>
        <button
          className={`nav-button ${isActive("/settings") ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={22} />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
