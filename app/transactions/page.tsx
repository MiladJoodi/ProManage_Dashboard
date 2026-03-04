"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { transactions } from "@/lib/data";
import type { TransactionType, TransactionStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const typeConfig: Record<
  TransactionType,
  { label: string; className: string; icon: React.ElementType; amountColor: string }
> = {
  income: {
    label: "Income",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: ArrowUpRight,
    amountColor: "text-emerald-600 dark:text-emerald-400",
  },
  expense: {
    label: "Expense",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: ArrowDownRight,
    amountColor: "text-red-600 dark:text-red-400",
  },
  transfer: {
    label: "Transfer",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: ArrowLeftRight,
    amountColor: "text-blue-600 dark:text-blue-400",
  },
};

const transactionStatusConfig: Record<
  TransactionStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.reference.toLowerCase().includes(search.toLowerCase()) ||
        txn.description.toLowerCase().includes(search.toLowerCase()) ||
        txn.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || txn.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netBalance };
  }, []);

  const statCards = [
    {
      label: "Total Income",
      value: formatCurrency(stats.totalIncome),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: "Net Balance",
      value: formatCurrency(stats.netBalance),
      icon: DollarSign,
      color:
        stats.netBalance >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      bg:
        stats.netBalance >= 0
          ? "bg-emerald-100 dark:bg-emerald-900/30"
          : "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage all financial transactions
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((txn, idx) => {
                const TypeIcon = typeConfig[txn.type].icon;
                const StatusIcon = transactionStatusConfig[txn.status].icon;
                return (
                  <motion.tr
                    key={txn.id}
                    className="border-b transition-colors hover:bg-muted/50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {txn.reference}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-0 gap-1",
                          typeConfig[txn.type].className
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig[txn.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[250px] truncate">{txn.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{txn.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-semibold",
                          typeConfig[txn.type].amountColor
                        )}
                      >
                        {txn.type === "expense" ? "- " : txn.type === "income" ? "+ " : ""}
                        {formatCurrency(txn.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-0 gap-1",
                          transactionStatusConfig[txn.status].className
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {transactionStatusConfig[txn.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(txn.date)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4" />
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          className="mt-12 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <DollarSign className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
