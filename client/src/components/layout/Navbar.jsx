import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  User,
  FolderKanban,
  BriefcaseBusiness,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();

  // =========================
  // User
  // =========================
  const [user, setUser] = useState(null);

  // =========================
  // Global Search
  // =========================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // =========================
  // Notifications
  // =========================
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationActionId, setNotificationActionId] = useState(null);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  // =========================
  // Load logged-in user
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // =========================
  // Global Search
  // =========================
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        setSearchLoading(true);
        setShowSearchResults(true);

        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Search failed");
        }

        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({
          students: [],
          projects: [],
          opportunities: [],
        });
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================
  // Fetch Notifications
  // =========================
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      setNotificationLoading(true);

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      setNotifications(data.notifications || []);
      setNotificationCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Notification error:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Load notifications when Navbar loads
  useEffect(() => {
    fetchNotifications();
  }, []);

  // =========================
  // Notification Bell
  // =========================
  const handleNotificationClick = () => {
    const nextState = !showNotifications;

    setShowNotifications(nextState);

    if (nextState) {
      fetchNotifications();
    }
  };

  // =========================
  // Accept Invitation
  // =========================
  const handleAcceptInvitation = async (notification) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      setNotificationActionId(notification.invitationId);

      const response = await fetch(
        `${API_URL}/api/invitations/${notification.invitationId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation");
      }

      // Refresh notifications after accepting
      await fetchNotifications();
    } catch (error) {
      console.error("Accept invitation error:", error);
      alert(error.message);
    } finally {
      setNotificationActionId(null);
    }
  };

  // =========================
  // Reject Invitation
  // =========================
  const handleRejectInvitation = async (notification) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      setNotificationActionId(notification.invitationId);

      const response = await fetch(
        `${API_URL}/api/invitations/${notification.invitationId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject invitation");
      }

      // Refresh notifications after rejecting
      await fetchNotifications();
    } catch (error) {
      console.error("Reject invitation error:", error);
      alert(error.message);
    } finally {
      setNotificationActionId(null);
    }
  };

  // =========================
  // Click Outside
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // Search Navigation
  // =========================
  const handleStudentClick = (student) => {
    setSearchQuery("");
    setShowSearchResults(false);

    navigate(`/dashboard/students/${student.id}`);
  };

  const handleProjectClick = (project) => {
    setSearchQuery("");
    setShowSearchResults(false);

    navigate(`/dashboard/projects/${project.id}`);
  };

  const handleOpportunityClick = (opportunity) => {
    setSearchQuery("");
    setShowSearchResults(false);

    navigate(`/dashboard/opportunities/${opportunity.id}`);
  };

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">

        {/* =========================
            Logo
        ========================= */}
        <div
          className="cursor-pointer text-xl font-bold"
          onClick={() => navigate("/dashboard")}
        >
          Campus<span className="text-primary">Connect</span>
        </div>

        {/* =========================
            Search
        ========================= */}
        <div
          ref={searchRef}
          className="relative hidden w-full max-w-xl md:block"
        >
          <div className="flex items-center rounded-lg border bg-muted/40 px-3">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSearchResults(true);
                }
              }}
              placeholder="Search students, projects, opportunities..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />

            {searchLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-12 max-h-[70vh] overflow-y-auto rounded-xl border bg-background p-2 shadow-xl">

              {searchLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : searchResults &&
                searchResults.students?.length === 0 &&
                searchResults.projects?.length === 0 &&
                searchResults.opportunities?.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Students */}
                  {searchResults?.students?.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                        Students
                      </p>

                      {searchResults.students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentClick(student)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {student.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {student.profile?.college ||
                                student.profile?.course ||
                                "Student"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {searchResults?.projects?.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                        Projects
                      </p>

                      {searchResults.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <FolderKanban className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {project.name}
                            </p>

                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Opportunities */}
                  {searchResults?.opportunities?.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                        Opportunities
                      </p>

                      {searchResults.opportunities.map((opportunity) => (
                        <button
                          key={opportunity.id}
                          onClick={() =>
                            handleOpportunityClick(opportunity)
                          }
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <BriefcaseBusiness className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {opportunity.title}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {opportunity.organization}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================
            Right Side
        ========================= */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative rounded-lg p-2 hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-background shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Notifications
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {notificationCount > 0
                        ? `${notificationCount} pending invitation${
                            notificationCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Loading */}
                {notificationLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  /* Empty */
                  <div className="py-10 text-center">
                    <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />

                    <p className="text-sm font-medium">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      New invitations will appear here.
                    </p>
                  </div>
                ) : (
                  /* Notifications */
                  <div className="max-h-[430px] overflow-y-auto">
                    {notifications.map((notification) => {
                      const isPending =
                        notification.status === "pending";

                      const isActionLoading =
                        notificationActionId ===
                        notification.invitationId;

                      return (
                        <div
                          key={notification.id}
                          className="border-b p-4 last:border-b-0"
                        >
                          <div className="flex gap-3">

                            {/* Icon */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-5">
                                <span className="font-semibold">
                                  {notification.sender.name}
                                </span>{" "}
                                {isPending
                                  ? "invited you to join"
                                  : `invitation was ${notification.status}`}
                              </p>

                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate(
                                    `/dashboard/projects/${notification.project.id}`
                                  );
                                }}
                                className="mt-1 text-sm font-medium text-primary hover:underline"
                              >
                                {notification.project.name}
                              </button>

                              {notification.role && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Role: {notification.role}
                                </p>
                              )}

                              {/* Actions */}
                              {isPending && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleAcceptInvitation(
                                        notification
                                      )
                                    }
                                    disabled={isActionLoading}
                                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isActionLoading ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                    Accept
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleRejectInvitation(
                                        notification
                                      )
                                    }
                                    disabled={isActionLoading}
                                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <X className="h-3 w-3" />
                                    Reject
                                  </button>
                                </div>
                              )}

                              {/* Status */}
                              {!isPending && (
                                <span className="mt-2 inline-block text-xs capitalize text-muted-foreground">
                                  {notification.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">
                {user?.name || "Student"}
              </p>

              <button
                onClick={() => navigate("/dashboard/profile")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted sm:block"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;