"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { alerts as initialAlerts } from "@/lib/data";
import { cn, formatDateTime } from "@/lib/utils";
import type { Alert, AlertSeverity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof Info; color: string; bg: string; border: string; badge: string }
> = {
  low: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-l-blue-500",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-l-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  high: {
    icon: AlertOctagon,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-l-orange-500",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  critical: {
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-l-red-500",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function AlertsPage() {
  const [alertsList, setAlertsList] = useState<Alert[]>([...initialAlerts]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all");

  const filtered = alertsList.filter((a) => {
    if (statusFilter === "active" && a.resolved) return false;
    if (statusFilter === "resolved" && !a.resolved) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    return true;
  });

  function handleResolve(id: string) {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
    toast.success("Alert resolved");
  }

  function handleDismiss(id: string) {
    setAlertsList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert dismissed");
  }

  return (
    <DashboardLayout pageTitle="System Alerts">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} alert{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No alerts</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No alerts match your current filters.
                </p>
              </motion.div>
            ) : (
              filtered.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={alert.id}
                    variants={listItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <Card
                      className={cn(
                        "border-l-4 transition-colors",
                        config.border,
                        alert.resolved && "opacity-60"
                      )}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div
                          className={cn(
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            config.bg
                          )}
                        >
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold">
                                  {alert.title}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs capitalize", config.badge)}
                                >
                                  {alert.severity}
                                </Badge>
                                {alert.resolved && (
                                  <Badge variant="secondary" className="text-xs">
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {alert.message}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span>Source: {alert.source}</span>
                                <span>&middot;</span>
                                <span>{formatDateTime(alert.date)}</span>
                              </div>
                            </div>

                            {!alert.resolved && (
                              <div className="flex shrink-0 items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolve(alert.id)}
                                >
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  Resolve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDismiss(alert.id)}
                                >
                                  <XCircle className="mr-1 h-3.5 w-3.5" />
                                  Dismiss
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
