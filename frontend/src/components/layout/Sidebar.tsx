import {
  FaChartLine,
  FaChartPie,
  FaFileAlt,
  FaHistory,
  FaMoneyBillWave,
  FaUsers,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import { clearAuth } from "../../utils/authStorage";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: FaChartPie,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: FaChartLine,
  },
  {
    name: "Revenue",
    path: "/revenue",
    icon: FaMoneyBillWave,
  },
  {
    name: "Users",
    path: "/users",
    icon: FaUsers,
  },
  {
    name: "Activity Log",
    path: "/activity-logs",
    icon: FaHistory,
  },
  {
  name: "Notifications",
  path: "/notifications/create",
  icon: FaBell,
},
  {
    name: "Reports",
    path: "/reports",
    icon: FaFileAlt,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-950 text-white">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold">
          AnalyticsPro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <FaSignOutAlt size={18} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;