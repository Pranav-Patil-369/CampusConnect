import { useEffect, useState } from "react";
import { Calendar, ExternalLink, Search } from "lucide-react";

const API_URL = "http://localhost:5000";

function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/opportunities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load opportunities"
          );
        }

        setOpportunities(data.opportunities || []);
      } catch (error) {
        console.error("Fetch opportunities error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const types = [
    "All",
    ...new Set(opportunities.map((opportunity) => opportunity.type)),
  ];

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchText) ||
      opportunity.description.toLowerCase().includes(searchText) ||
      opportunity.organization.toLowerCase().includes(searchText) ||
      opportunity.type.toLowerCase().includes(searchText);

    const matchesType =
      typeFilter === "All" || opportunity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          Loading opportunities...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive">
          Failed to load opportunities
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Opportunities
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover internships, hackathons, workshops and
          competitions.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-md border bg-background pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 rounded-md border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filteredOpportunities.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">
            No opportunities found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Type */}
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {opportunity.type}
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-4 text-xl font-semibold">
                {opportunity.title}
              </h2>

              {/* Organization */}
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {opportunity.organization}
              </p>

              {/* Description */}
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {opportunity.description}
              </p>

              {/* Deadline */}
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />

                <span>
                  Deadline: {formatDate(opportunity.deadline)}
                </span>
              </div>

              {/* Action */}
              {opportunity.link && (
                <a
                  href={opportunity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  View Opportunity
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Opportunities;