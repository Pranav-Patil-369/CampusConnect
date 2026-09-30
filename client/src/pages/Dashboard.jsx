import {
  ArrowRight,
  BriefcaseBusiness,
  FolderKanban,
  Users,
} from "lucide-react";

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName = user?.name || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <p className="text-sm font-medium text-primary">Dashboard</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Welcome back, {userName} 👋
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover people, build projects, and find opportunities on campus.
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold">What do you want to do?</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Find Teammates */}
          <div className="group rounded-xl border bg-card p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Users className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold">Find Teammates</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Find students with the skills and interests you need.
            </p>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"
            >
              Explore Team Finder
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>

          {/* Projects */}
          <div className="group rounded-xl border bg-card p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold">Explore Projects</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Discover projects you can contribute to or showcase your work.
            </p>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"
            >
              View Projects
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>

          {/* Opportunities */}
          <div className="group rounded-xl border bg-card p-5 transition hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold">Find Opportunities</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Discover internships, events, clubs, and other opportunities.
            </p>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"
            >
              Explore Opportunities
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Profile Completion */}
      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary">
              Get discovered
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Complete your student profile
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add your skills, interests, experience, and availability to get
              better collaboration matches.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Complete Profile
          </button>
        </div>
      </section>

      {/* Recent Activity Placeholder */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Opportunities</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Opportunities relevant to students on CampusConnect.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border bg-card p-8 text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />

          <h3 className="mt-3 font-medium">Opportunities will appear here</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            We're building the opportunity system next.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;