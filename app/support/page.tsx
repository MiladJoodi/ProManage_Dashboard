"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { supportTickets as initialTickets } from "@/lib/data";
import { cn, formatDate, generateId } from "@/lib/utils";
import type { SupportTicket, TicketStatus, TicketPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  category: z.string().min(1, "Category is required"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const statusConfig: Record<
  TicketStatus,
  { label: string; icon: typeof Circle; color: string }
> = {
  open: { label: "Open", icon: Circle, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  "in-progress": { label: "In Progress", icon: Loader2, color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  closed: { label: "Closed", icon: Clock, color: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
};

const priorityConfig: Record<TicketPriority, string> = {
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
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

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([...initialTickets]);
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "",
    },
  });

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  function onSubmitTicket(data: TicketFormValues) {
    const newTicket: SupportTicket = {
      id: `ticket-${generateId()}`,
      userId: "user-1",
      subject: data.subject,
      description: data.description,
      status: "open",
      priority: data.priority,
      category: data.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    form.reset();
    setDialogOpen(false);
    toast.success("Ticket created", {
      description: "Your support ticket has been submitted.",
    });
  }

  return (
    <DashboardLayout pageTitle="Support">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and our team will get back to you soon.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitTicket)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of the issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your issue in detail..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bug Report">Bug Report</SelectItem>
                              <SelectItem value="Feature Request">Feature Request</SelectItem>
                              <SelectItem value="Performance">Performance</SelectItem>
                              <SelectItem value="Account">Account</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Ticket</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ticket List */}
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
                  <LifeBuoy className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No tickets</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No support tickets match your current filter.
                </p>
              </motion.div>
            ) : (
              filtered.map((ticket) => {
                const statusCfg = statusConfig[ticket.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <motion.div
                    key={ticket.id}
                    variants={listItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <Card className="transition-colors hover:bg-accent/30">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold">
                                {ticket.subject}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", statusCfg.color)}
                              >
                                {statusCfg.label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs capitalize",
                                  priorityConfig[ticket.priority]
                                )}
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {ticket.category}
                              </span>
                              <span>&middot;</span>
                              <span>Created {formatDate(ticket.createdAt)}</span>
                            </div>
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
