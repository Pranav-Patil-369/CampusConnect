import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your CampusConnect account and session.
        </p>
      </div>

      {/* Account Information */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Basic information about your CampusConnect account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="mt-1 text-base font-medium">
              {user?.name || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1 text-base font-medium">
              {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your current CampusConnect session.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90"
        >
          Logout
        </button>
      </section>

      {/* About */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">About CampusConnect</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          CampusConnect helps students discover people, find teammates,
          collaborate on projects, and discover opportunities.
        </p>

        <div className="mt-5 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Version</p>
          <p className="mt-1 text-sm text-muted-foreground">
            CampusConnect MVP
          </p>
        </div>
      </section>
    </div>
  );
}

export default Settings;