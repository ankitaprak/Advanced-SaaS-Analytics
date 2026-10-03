import { useEffect, useState } from "react";
import {
  FaChartBar,
  FaDollarSign,
  FaExchangeAlt,
  FaUsers,
  FaFileAlt,
  FaDownload,
} from "react-icons/fa";

import DateRangeFilter from "../components/dashboard/DateRangeFilter";
import StatCard from "../components/dashboard/StatCard";
import { downloadReportCsv, downloadReportPdf } from "../utils/reportUtils";

import { generateReport, getReportSummary } from "../services/reportApi";

import type {
  GeneratedReport,
  ReportRange,
  ReportSummary,
} from "../services/reportApi";

function ReportsPage() {
  const [dateRange, setDateRange] = useState<ReportRange>("30");

  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [report, setReport] = useState<GeneratedReport | null>(null);

  const [generating, setGenerating] = useState(false);

  const [generateMessage, setGenerateMessage] = useState("");

  useEffect(() => {
    const fetchReportSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getReportSummary(dateRange);

        if (!response.success) {
          setError(response.message);
          return;
        }

        setSummary(response.data);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Failed to load report data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportSummary();
  }, [dateRange]);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setGenerateMessage("");
      setError("");

      const response = await generateReport(dateRange);

      if (!response.success) {
        setError(response.message);
        return;
      }

      setReport(response.data);

      setGenerateMessage(
        `Report generated successfully with ${response.data.transactions.length} transactions and ${response.data.users.length} users.`,
      );
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
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
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

          <p className="mt-1 text-slate-500">
            View business performance reports for the selected period.
          </p>
        </div>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaFileAlt size={16} />

          {generating ? "Generating..." : "Generate Report"}
        </button>

        {generateMessage && (
          <p className="text-sm text-green-600">{generateMessage}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : formatCurrency(summary?.totalRevenue || 0)}
          change={
            loading ? "Loading report data" : "Completed transaction revenue"
          }
          changeType="positive"
          icon={<FaDollarSign size={20} />}
        />

        <StatCard
          title="Total Transactions"
          value={loading ? "..." : String(summary?.totalTransactions || 0)}
          change={
            loading
              ? "Loading report data"
              : `${summary?.completedTransactions || 0} completed`
          }
          changeType="positive"
          icon={<FaExchangeAlt size={20} />}
        />

        <StatCard
          title="Total Users"
          value={loading ? "..." : String(summary?.totalUsers || 0)}
          change={
            loading
              ? "Loading report data"
              : "Users registered during selected period"
          }
          changeType="positive"
          icon={<FaUsers size={20} />}
        />

        <StatCard
          title="Average Transaction"
          value={
            loading
              ? "..."
              : formatCurrency(summary?.averageTransactionValue || 0)
          }
          change={
            loading
              ? "Loading report data"
              : "Average completed transaction value"
          }
          changeType="positive"
          icon={<FaChartBar size={20} />}
        />
      </div>

      {/* Transaction Status */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Transaction Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Transaction breakdown for the selected period.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-slate-500">Completed</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "..." : summary?.completedTransactions || 0}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-slate-500">Pending</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "..." : summary?.pendingTransactions || 0}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-slate-500">Failed</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "..." : summary?.failedTransactions || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Generated Report Result */}
      {report && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Generated Report
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Report generated for the last {report.range} days.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadReportCsv(report)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FaDownload size={15} />
                Download CSV
              </button>

              <button
                type="button"
                onClick={() => downloadReportPdf(report)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FaDownload size={15} />
                Download PDF
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Transactions Included</p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {report.transactions.length}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Users Included</p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {report.users.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
