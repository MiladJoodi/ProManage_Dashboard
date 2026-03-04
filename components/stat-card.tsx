"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: StatCardProps) {
  const isIncrease = changeType === "increase";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
    >
      <Card className="group relative overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* Subtle gradient accent */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            isIncrease
              ? "bg-gradient-to-r from-emerald-500/80 to-emerald-400/40"
              : "bg-gradient-to-r from-red-500/80 to-red-400/40"
          )}
        />

        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                    isIncrease
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {isIncrease ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(change)}%
                </div>
                <span className="text-xs text-muted-foreground">
                  vs last month
                </span>
              </div>
            </div>

            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300",
                "bg-primary/10 group-hover:bg-primary/15"
              )}
            >
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
