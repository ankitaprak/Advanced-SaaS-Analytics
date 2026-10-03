import { useEffect, useState } from "react";

import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import UserGrowthChart from "../components/dashboard/UserGrowthChart";
import TrafficChart from "../components/dashboard/TrafficChart";
import DateRangeFilter from "../components/dashboard/DateRangeFilter";

import { FaDollarSign, FaUsers, FaBullseye, FaChartLine } from "react-icons/fa";

import { getDashboardSummary } from "../services/dashboardApi";

import type { DashboardSummary } from "../services/dashboardApi";

function DashboardPage() {
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "365">("30");

  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboardSummary(dateRange);

        if (!response.success) {
          setError(response.message);
          return;
        }

        setSummary(response.data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Failed to load dashboard summary",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [dateRange]);

  const formatRevenue = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-slate-500">
            Welcome to your analytics dashboard.
          </p>
        </div>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : formatRevenue(summary?.totalRevenue || 0)}
          change="From completed transactions"
          changeType="positive"
          icon={<FaDollarSign size={20} />}
        />

        <StatCard
          title="Total Users"
          value={loading ? "..." : String(summary?.totalUsers || 0)}
          change="Registered platform users"
          changeType="positive"
          icon={<FaUsers size={20} />}
        />

        <StatCard
          title="Completed Transactions"
          value={loading ? "..." : String(summary?.completedTransactions || 0)}
          change="Successfully completed"
          changeType="positive"
          icon={<FaBullseye size={20} />}
        />

        <StatCard
          title="Total Transactions"
          value={loading ? "..." : String(summary?.totalTransactions || 0)}
          change={
            loading
              ? "Loading transaction data"
              : `${summary?.pendingTransactions || 0} pending • ${
                  summary?.failedTransactions || 0
                } failed`
          }
          changeType="positive"
          icon={<FaChartLine size={20} />}
        />
      </div>

      {/* Revenue Chart + User Growth Chart */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart dateRange={dateRange} />

        <UserGrowthChart dateRange={dateRange} />
      </div>

      {/* Traffic Chart */}
      <div className="mt-6">
        <TrafficChart dateRange={dateRange} />
      </div>
    </div>
  );
}

export default DashboardPage;
