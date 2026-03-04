"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Clock,
  ServerCrash,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, dashboardStats } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

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

const revenueExpenseData = [
  { month: "Jan", revenue: 42000, expenses: 28000 },
  { month: "Feb", revenue: 48500, expenses: 31000 },
  { month: "Mar", revenue: 52835, expenses: 34200 },
  { month: "Apr", revenue: 61200, expenses: 37500 },
  { month: "May", revenue: 55800, expenses: 33400 },
  { month: "Jun", revenue: 67400, expenses: 38900 },
];

const incomeBreakdown = [
  { name: "License Sales", value: 45000, color: "#3b82f6" },
  { name: "Services", value: 18000, color: "#22c55e" },
  { name: "Add-ons", value: 8500, color: "#f59e0b" },
  { name: "Consulting", value: 12000, color: "#8b5cf6" },
  { name: "Support Plans", value: 6200, color: "#ec4899" },
];

const errorRateData = [
  { time: "00:00", errors: 2 },
  { time: "04:00", errors: 1 },
  { time: "08:00", errors: 5 },
  { time: "12:00", errors: 12 },
  { time: "16:00", errors: 8 },
  { time: "20:00", errors: 3 },
  { time: "23:59", errors: 1 },
];

const recentErrors = [
  {
    id: "err-1",
    title: "High CPU Usage",
    severity: "high" as const,
    source: "System Monitor",
    timestamp: "2026-03-04T07:45:00Z",
    resolved: false,
  },
  {
    id: "err-2",
    title: "Unauthorized Access Attempt",
    severity: "critical" as const,
    source: "Security Monitor",
    timestamp: "2026-03-04T06:30:00Z",
    resolved: false,
  },
  {
    id: "err-3",
    title: "SSL Certificate Expiring",
    severity: "medium" as const,
    source: "Security Scanner",
    timestamp: "2026-03-03T12:00:00Z",
    resolved: false,
  },
  {
    id: "err-4",
    title: "Database Backup Complete",
    severity: "low" as const,
    source: "Backup Service",
    timestamp: "2026-03-04T02:00:00Z",
    resolved: true,
  },
  {
    id: "err-5",
    title: "API Rate Limit Exceeded",
    severity: "medium" as const,
    source: "API Gateway",
    timestamp: "2026-03-03T15:20:00Z",
    resolved: true,
  },
];

const errorCategories = [
  { name: "Infrastructure", value: 35, color: "#ef4444" },
  { name: "Security", value: 25, color: "#f59e0b" },
  { name: "Application", value: 22, color: "#3b82f6" },
  { name: "Network", value: 12, color: "#8b5cf6" },
  { name: "Database", value: 6, color: "#22c55e" },
];

const severityColors: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-500",
  medium: "bg-amber-500/10 text-amber-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
};

export default function ReportsPage() {
  const financialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }, []);

  return (
    <DashboardLayout pageTitle="Reports">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <Tabs defaultValue="financial" className="space-y-6">
          <motion.div variants={itemVariants}>
            <TabsList>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="errors">Error Reports</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Summary Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-3">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Income
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(financialSummary.totalIncome)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-500/10 p-3">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Expenses
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(financialSummary.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-3">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Net Profit
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(financialSummary.netProfit)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Revenue vs Expenses
                    </CardTitle>
                    <CardDescription>
                      Monthly comparison for 2026
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueExpenseData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
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
                            formatter={(value: number | undefined, name: string | undefined) => [
                              formatCurrency(value ?? 0),
                              (name ?? "") === "revenue" ? "Revenue" : "Expenses",
                            ]}
                          />
                          <Legend
                            formatter={(value) => (
                              <span style={{ color: "hsl(var(--foreground))" }}>
                                {value === "revenue" ? "Revenue" : "Expenses"}
                              </span>
                            )}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                          />
                          <Bar
                            dataKey="expenses"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Income Breakdown by Category
                    </CardTitle>
                    <CardDescription>
                      Distribution of revenue sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {incomeBreakdown.map((entry, index) => (
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
                              formatCurrency(value ?? 0),
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
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Transactions Table */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>
                    Latest financial transactions summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="font-mono text-sm">
                            {txn.reference}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {txn.description}
                          </TableCell>
                          <TableCell>{txn.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                txn.type === "income"
                                  ? "border-emerald-500/30 text-emerald-500"
                                  : txn.type === "expense"
                                    ? "border-red-500/30 text-red-500"
                                    : "border-blue-500/30 text-blue-500"
                              }
                            >
                              {txn.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(txn.date)}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge[txn.status] || "secondary"}>
                              {txn.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span
                              className={
                                txn.type === "income"
                                  ? "text-emerald-500"
                                  : txn.type === "expense"
                                    ? "text-red-500"
                                    : ""
                              }
                            >
                              {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                              {formatCurrency(txn.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Error Reports Tab */}
          <TabsContent value="errors" className="space-y-6">
            {/* System Health Overview */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-4"
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          System Health
                        </p>
                        <p className="text-2xl font-bold">
                          {dashboardStats.systemHealth}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-500/10 p-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Alerts
                        </p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-500/10 p-3">
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Avg Response
                        </p>
                        <p className="text-2xl font-bold">245ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-violet-500/10 p-3">
                        <ServerCrash className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Uptime
                        </p>
                        <p className="text-2xl font-bold">99.9%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Error Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Error Rate Over Time
                    </CardTitle>
                    <CardDescription>
                      Errors per hour in the last 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={errorRateData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="time"
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
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
                              `${value ?? 0} errors`,
                              "Count",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="errors"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: "#ef4444", r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Error Categories Breakdown
                    </CardTitle>
                    <CardDescription>
                      Distribution by error category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={errorCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {errorCategories.map((entry, index) => (
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
                              `${value ?? 0}%`,
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
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Errors Table */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recent Errors & Alerts
                  </CardTitle>
                  <CardDescription>
                    Latest system errors and security alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentErrors.map((error) => (
                        <TableRow key={error.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                className={`h-4 w-4 ${
                                  error.severity === "critical"
                                    ? "text-red-500"
                                    : error.severity === "high"
                                      ? "text-orange-500"
                                      : error.severity === "medium"
                                        ? "text-amber-500"
                                        : "text-emerald-500"
                                }`}
                              />
                              {error.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                severityColors[error.severity]
                              }`}
                            >
                              {error.severity}
                            </span>
                          </TableCell>
                          <TableCell>{error.source}</TableCell>
                          <TableCell>{formatDate(error.timestamp)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={error.resolved ? "secondary" : "destructive"}
                            >
                              {error.resolved ? "Resolved" : "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
