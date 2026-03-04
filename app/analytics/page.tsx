"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Target,
  CheckSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { tasks, projects, users, dashboardStats } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 48500 },
  { month: "Mar", revenue: 52835 },
  { month: "Apr", revenue: 61200 },
  { month: "May", revenue: 55800 },
  { month: "Jun", revenue: 67400 },
];

const monthlySummary = [
  { month: "January", revenue: 42000, expenses: 28000, profit: 14000, tasksCompleted: 12 },
  { month: "February", revenue: 48500, expenses: 31000, profit: 17500, tasksCompleted: 18 },
  { month: "March", revenue: 52835, expenses: 34200, profit: 18635, tasksCompleted: 15 },
  { month: "April", revenue: 61200, expenses: 37500, profit: 23700, tasksCompleted: 22 },
  { month: "May", revenue: 55800, expenses: 33400, profit: 22400, tasksCompleted: 19 },
  { month: "June", revenue: 67400, expenses: 38900, profit: 28500, tasksCompleted: 24 },
];

const TASK_STATUS_COLORS: Record<string, string> = {
  todo: "#64748b",
  "in-progress": "#3b82f6",
  "in-review": "#f59e0b",
  done: "#22c55e",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

export default function AnalyticsPage() {
  const taskStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: TASK_STATUS_LABELS[status] || status,
      value: count,
      color: TASK_STATUS_COLORS[status] || "#94a3b8",
    }));
  }, []);

  const projectProgressData = useMemo(
    () =>
      projects.map((project) => ({
        name: project.name.length > 20 ? project.name.slice(0, 20) + "..." : project.name,
        progress: project.progress,
      })),
    []
  );

  const teamPerformanceData = useMemo(() => {
    const completedByUser: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.status === "done") {
        completedByUser[task.assigneeId] = (completedByUser[task.assigneeId] || 0) + 1;
      }
    });
    return users.map((user) => ({
      name: user.name.split(" ")[0],
      completed: completedByUser[user.id] || 0,
    }));
  }, []);

  const totalTasksForDonut = taskStatusData.reduce((sum, d) => sum + d.value, 0);

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      icon: TrendingUp,
      change: "+12.5%",
      trend: "up" as const,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Project Completion",
      value: dashboardStats.completionRate + "%",
      icon: Target,
      change: "+4.2%",
      trend: "up" as const,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Tasks",
      value: String(dashboardStats.activeTasks),
      icon: CheckSquare,
      change: "-2",
      trend: "down" as const,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "System Health",
      value: dashboardStats.systemHealth + "%",
      icon: Activity,
      change: "+1.3%",
      trend: "up" as const,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <DashboardLayout pageTitle="Analytics">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <motion.div key={kpi.title} variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {kpi.value}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 ${kpi.bg}`}>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-amber-500" />
                    )}
                    <span
                      className={
                        kpi.trend === "up"
                          ? "font-medium text-emerald-500"
                          : "font-medium text-amber-500"
                      }
                    >
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number | undefined) => [
                          formatCurrency(value ?? 0),
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Task Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number | undefined, name: string | undefined) => [
                          `${value ?? 0} tasks`,
                          name ?? "",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {value}
                          </span>
                        )}
                      />
                      {/* Center label */}
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalTasksForDonut}
                      </text>
                      <text
                        x="50%"
                        y="56%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-sm"
                      >
                        Total
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Progress */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectProgressData}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={130}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number | undefined) => [`${value ?? 0}%`, "Progress"]}
                      />
                      <Bar
                        dataKey="progress"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Performance */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamPerformanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number | undefined) => [
                          `${value ?? 0} tasks`,
                          "Completed",
                        ]}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Monthly Summary Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Tasks Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummary.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.expenses)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-emerald-500">
                          {formatCurrency(row.profit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{row.tasksCompleted}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
