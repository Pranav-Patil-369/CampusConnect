import { Bell, Search } from "lucide-react";

function Navbar() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        {/* Brand */}
        <div className="shrink-0">
          <h1 className="text-xl font-bold text-primary">CampusConnect</h1>
        </div>

        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search students, projects, opportunities..."
            className="h-10 w-full rounded-md border bg-background pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {userInitial}
            </div>

            <span className="hidden text-sm font-medium sm:block">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;