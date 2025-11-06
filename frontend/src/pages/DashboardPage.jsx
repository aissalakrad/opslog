import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, ticketsRes] = await Promise.all([
          axios.get("http://localhost:4000/api/tickets/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/tickets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSummary(summaryRes.data.summary);
        setRecentTickets(ticketsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const chartData = [
    { name: "Open", value: summary.open },
    { name: "In Progress", value: summary.in_progress },
    { name: "Closed", value: summary.closed },
  ];

const COLORS = ['#22C55E', '#FFBB28', '#9CA3AF']; 

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {user?.role === "admin"
          ? "Admin Dashboard"
          : user?.role === "technician"
          ? "Technician Dashboard"
          : "Your Dashboard"}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500 text-sm">Total Tickets</h2>
          <p className="text-3xl font-semibold text-gray-800">{summary.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500 text-sm">Open</h2>
          <p className="text-3xl font-semibold text-green-600">{summary.open}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500 text-sm">In Progress</h2>
          <p className="text-3xl font-semibold text-yellow-600">{summary.in_progress}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500 text-sm">Closed</h2>
          <p className="text-3xl font-semibold text-gray-600">{summary.closed}</p>
        </div>
      </div>

      {/* Chart + Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow h-80 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Ticket Status Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={85}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Tickets</h2>
          <ul className="divide-y divide-gray-200">
            {recentTickets.map((ticket) => (
              <li key={ticket.id} className="py-3">
                <p className="font-medium text-gray-800">{ticket.title}</p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`${
                      ticket.status === "open"
                        ? "text-green-600"
                        : ticket.status === "in progress"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}