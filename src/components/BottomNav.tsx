import { Home, BarChart2, Settings } from "lucide-react";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button className="flex flex-col items-center gap-1 text-foreground p-2">
          <Home size={22} />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground p-2">
          <BarChart2 size={22} />
          <span className="text-xs">Stats</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground p-2">
          <Settings size={22} />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
