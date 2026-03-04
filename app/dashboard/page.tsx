"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  Edit3,
  UserPlus,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { StatCard } from "@/components/stat-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import {
  dashboardStats,
  projects,
  tasks,
  activities,
  users,
} from "@/lib/data";
import { cn, formatCurrency, formatDate, getInitials, getRelativeTime } from "@/lib/utils";

// --- Animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// --- Revenue data ---
const revenueData = [
  { month: "Oct", revenue: 28400, target: 25000 },
  { month: "Nov", revenue: 35200, target: 30000 },
  { month: "Dec", revenue: 42100, target: 35000 },
  { month: "Jan", revenue: 38700, target: 37000 },
  { month: "Feb", revenue: 46300, target: 40000 },
  { month: "Mar", revenue: 52800, target: 45000 },
];

// --- Pie chart colors ---
const TASK_COLORS = [
  "oklch(0.65 0.18 250)",   // todo - blue
  "oklch(0.7 0.19 55)",     // in-progress - amber
  "oklch(0.65 0.2 300)",    // in-review - purple
  "oklch(0.65 0.2 150)",    // done - green
];

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

// --- Activity icons ---
function getActivityIcon(action: string) {
  switch (action) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "created":
      return <PlusCircle className="h-4 w-4 text-blue-500" />;
    case "commented":
      return <MessageSquare className="h-4 w-4 text-amber-500" />;
    case "updated":
      return <Edit3 className="h-4 w-4 text-purple-500" />;
    case "assigned":
      return <UserPlus className="h-4 w-4 text-indigo-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

// --- Status badge variant mapping ---
function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "on-hold":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "";
  }
}

// --- Priority badge styling ---
function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "low":
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    default:
      return "";
  }
}

// --- Urgency color for deadlines ---
function getDeadlineUrgency(dueDate: string): {
  class: string;
  label: string;
} {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      class: "text-red-600 dark:text-red-400",
      label: "Overdue",
    };
  }
  if (diffDays <= 7) {
    return {
      class: "text-amber-600 dark:text-amber-400",
      label: "This week",
    };
  }
  return {
    class: "text-emerald-600 dark:text-emerald-400",
    label: "Upcoming",
  };
}

// --- Custom chart tooltip ---
function CustomRevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
        <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">
              {entry.dataKey}:
            </span>
            <span className="font-medium text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-foreground">
          {payload[0].name}: {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
}

// ============================================================
// Main Dashboard Page
// ============================================================

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  // Ensure charts only render client-side (Recharts SSR workaround)
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Compute task distribution ---
  const taskDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      todo: 0,
      "in-progress": 0,
      "in-review": 0,
      done: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: TASK_STATUS_LABELS[status] || status,
      value: count,
      status,
    }));
  }, []);

  const totalTasks = taskDistribution.reduce((sum, d) => sum + d.value, 0);

  // --- Upcoming deadlines (sorted by nearest due date, non-done) ---
  const upcomingDeadlines = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== "done")
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5);
  }, []);

  // --- Helper: get project name from id ---
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown";
  };

  // --- Helper: get user by id ---
  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-6 sm:p-8"
      >
        {/* ============ Page Header ============ */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here is an overview of your projects and team activity.
          </p>
        </motion.div>

        {/* ============ KPI Stats Row ============ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Projects"
              value={dashboardStats.totalProjects}
              change={12}
              changeType="increase"
              icon={FolderKanban}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Tasks"
              value={dashboardStats.activeTasks}
              change={8}
              changeType="increase"
              icon={CheckSquare}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Team Members"
              value={dashboardStats.teamMembers}
              change={3}
              changeType="decrease"
              icon={Users}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
              change={5}
              changeType="increase"
              icon={TrendingUp}
            />
          </motion.div>
        </div>

        {/* ============ Two-column layout ============ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ---- Left column (wider ~60%) ---- */}
          <div className="space-y-6 lg:col-span-3">
            {/* Revenue Overview Chart */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>
                      Monthly revenue vs target for the last 6 months
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal">
                    Last 6 months
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
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
                                stopColor="var(--color-chart-1)"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--color-chart-1)"
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                            <linearGradient
                              id="targetGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="var(--color-chart-2)"
                                stopOpacity={0.15}
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--color-chart-2)"
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) =>
                              `$${(val / 1000).toFixed(0)}k`
                            }
                            className="fill-muted-foreground"
                          />
                          <Tooltip content={<CustomRevenueTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="target"
                            stroke="var(--color-chart-2)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="url(#targetGradient)"
                            name="Target"
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-chart-1)"
                            strokeWidth={2.5}
                            fill="url(#revenueGradient)"
                            name="Revenue"
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Distribution Donut */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Task Distribution
                  </CardTitle>
                  <CardDescription>
                    Current breakdown of tasks by status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="relative h-[220px] w-[220px] shrink-0">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={taskDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {taskDistribution.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={TASK_COLORS[index % TASK_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-foreground">
                          {totalTasks}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Total Tasks
                        </span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
                      {taskDistribution.map((entry, index) => (
                        <div
                          key={entry.status}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                TASK_COLORS[index % TASK_COLORS.length],
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.name}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {entry.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ---- Right column (~40%) ---- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Activities */}
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest actions from your team
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                            {getInitials(activity.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.action)}
                            <p className="text-sm leading-tight text-foreground">
                              <span className="font-medium">
                                {activity.userName}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {activity.action}
                              </span>{" "}
                              <span className="font-medium">
                                {activity.target}
                              </span>
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {activity.details}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70">
                            {getRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Projects */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Active Projects
                    </CardTitle>
                    <CardDescription>
                      Track progress across all projects
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                      >
                        {/* Project header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {project.name}
                            </h4>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 text-[10px] capitalize",
                              getStatusBadgeClass(project.status)
                            )}
                          >
                            {project.status}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium text-foreground">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-1.5" />
                        </div>

                        {/* Budget */}
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(project.spent)}{" "}
                            <span className="text-muted-foreground font-normal">
                              / {formatCurrency(project.budget)}
                            </span>
                          </span>
                        </div>

                        {/* Team avatars */}
                        <div className="flex items-center -space-x-2">
                          {project.teamMembers.slice(0, 4).map((memberId) => {
                            const user = getUserById(memberId);
                            return (
                              <Avatar
                                key={memberId}
                                className="h-7 w-7 border-2 border-card"
                              >
                                <AvatarFallback className="text-[9px] font-medium bg-primary/10 text-primary">
                                  {user ? getInitials(user.name) : "?"}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })}
                          {project.teamMembers.length > 4 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium text-muted-foreground">
                              +{project.teamMembers.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    Upcoming Deadlines
                  </CardTitle>
                  <CardDescription>
                    Tasks sorted by nearest due date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((task) => {
                      const urgency = getDeadlineUrgency(task.dueDate);
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              urgency.label === "Overdue"
                                ? "bg-red-500/10"
                                : urgency.label === "This week"
                                ? "bg-amber-500/10"
                                : "bg-emerald-500/10"
                            )}
                          >
                            {urgency.label === "Overdue" ? (
                              <AlertTriangle
                                className={cn("h-4 w-4", urgency.class)}
                              />
                            ) : (
                              <CalendarDays
                                className={cn("h-4 w-4", urgency.class)}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getProjectName(task.projectId)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn("text-[11px] font-medium", urgency.class)}
                              >
                                {formatDate(task.dueDate)}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] capitalize",
                                  getPriorityBadgeClass(task.priority)
                                )}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
