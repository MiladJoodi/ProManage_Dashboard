"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Trash2,
  Search,
  Filter,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { activities } from "@/lib/data";
import { getRelativeTime, getInitials, formatDate } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const actionConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  created: {
    icon: Plus,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Created",
  },
  updated: {
    icon: Pencil,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Updated",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/20",
    label: "Completed",
  },
  commented: {
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Commented",
  },
  assigned: {
    icon: UserPlus,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    label: "Assigned",
  },
  deleted: {
    icon: Trash2,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    label: "Deleted",
  },
};

const filterOptions = [
  { value: "all", label: "All Activities" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "completed", label: "Completed" },
  { value: "commented", label: "Commented" },
  { value: "assigned", label: "Assigned" },
];

const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

function getAvatarColor(userId: string): string {
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarColors.length;
  return avatarColors[index];
}

function getDateKey(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(timestamp);
}

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        searchQuery === "" ||
        activity.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction =
        actionFilter === "all" || activity.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [searchQuery, actionFilter]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof filteredActivities> = {};
    filteredActivities.forEach((activity) => {
      const key = getDateKey(activity.timestamp);
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  const dateKeys = Object.keys(groupedActivities);

  return (
    <DashboardLayout pageTitle="Activities">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header with Search and Filters */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={actionFilter}
                    onValueChange={setActionFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          {dateKeys.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <p className="text-muted-foreground">
                No activities match your filters.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {dateKeys.map((dateKey) => (
                <motion.div key={dateKey} variants={itemVariants}>
                  {/* Date Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <Badge variant="outline" className="text-sm font-medium">
                      {dateKey}
                    </Badge>
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {groupedActivities[dateKey].length} activit
                      {groupedActivities[dateKey].length === 1 ? "y" : "ies"}
                    </span>
                  </div>

                  {/* Timeline Items */}
                  <div className="relative ml-4 space-y-0">
                    {/* Connecting line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {groupedActivities[dateKey].map((activity) => {
                        const config = actionConfig[activity.action] || actionConfig.updated;
                        const ActionIcon = config.icon;

                        return (
                          <motion.div
                            key={activity.id}
                            variants={itemVariants}
                            className="relative flex gap-4 pl-2"
                          >
                            {/* Timeline dot */}
                            <div
                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${config.bg}`}
                            >
                              <ActionIcon
                                className={`h-4 w-4 ${config.color}`}
                              />
                            </div>

                            {/* Content */}
                            <Card className="flex-1">
                              <CardContent className="p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback
                                        className={`text-xs text-white ${getAvatarColor(
                                          activity.userId
                                        )}`}
                                      >
                                        {getInitials(activity.userName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        <span className="font-semibold text-foreground">
                                          {activity.userName}
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                          {activity.action}
                                        </span>{" "}
                                        <span className="font-medium text-foreground">
                                          {activity.target}
                                        </span>
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {activity.details}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:shrink-0">
                                    <Badge
                                      variant="outline"
                                      className={`${config.color} border-current/20 text-xs`}
                                    >
                                      {config.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {getRelativeTime(activity.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
