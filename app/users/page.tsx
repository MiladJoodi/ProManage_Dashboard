"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Shield,
  Clock,
  ListTodo,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

import { users as initialUsers, tasks } from "@/lib/data";
import type { User, UserRole, UserStatus } from "@/lib/types";
import { cn, formatDate, getInitials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["admin", "manager", "user"]),
  department: z.string().min(1, "Department is required"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const editUserSchema = z.object({
  role: z.enum(["admin", "manager", "user"]),
  department: z.string().min(1, "Department is required"),
  status: z.enum(["active", "inactive", "suspended"]),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const roleConfig: Record<
  UserRole,
  { label: string; color: string; bgColor: string; avatarBg: string }
> = {
  admin: {
    label: "Admin",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
    avatarBg: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  },
  manager: {
    label: "Manager",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
    avatarBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  },
  user: {
    label: "User",
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    avatarBg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

const statusConfig: Record<
  UserStatus,
  { label: string; dotColor: string }
> = {
  active: {
    label: "Active",
    dotColor: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    dotColor: "bg-gray-400",
  },
  suspended: {
    label: "Suspended",
    dotColor: "bg-red-500",
  },
};

function getTaskCountForUser(userId: string): number {
  return tasks.filter((t) => t.assigneeId === userId).length;
}

function getUserTasks(userId: string) {
  return tasks.filter((t) => t.assigneeId === userId);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UsersPage() {
  // Local mutable list so invite / edit works in-session
  const [usersList, setUsersList] = useState<User[]>([...initialUsers]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ---- Filtering ----
  const filtered = useMemo(() => {
    let list = usersList;
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [usersList, search, roleFilter]);

  // ---- Invite form ----
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      department: "",
    },
  });

  function onInvite(values: InviteFormValues) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: values.email,
      password: "",
      name: values.name,
      role: values.role,
      phone: "",
      department: values.department,
      status: "active",
      avatar: "",
      bio: "",
      createdAt: new Date().toISOString(),
      lastLogin: "",
    };
    setUsersList((prev) => [...prev, newUser]);
    setInviteOpen(false);
    inviteForm.reset();
  }

  // ---- Edit form ----
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: "user",
      department: "",
      status: "active",
    },
  });

  function openEditDialog(user: User) {
    setSelectedUser(user);
    editForm.reset({
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setDetailOpen(false);
    setEditOpen(true);
  }

  function onEditSubmit(values: EditUserFormValues) {
    if (!selectedUser) return;
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, ...values } : u
      )
    );
    setSelectedUser((prev) => (prev ? { ...prev, ...values } : null));
    setEditOpen(false);
  }

  function openDetailDialog(user: User) {
    setSelectedUser(user);
    setDetailOpen(true);
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <DashboardLayout>
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[220px]"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | "all")}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => { inviteForm.reset(); setInviteOpen(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* ---- User Grid ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={roleFilter + search}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => openDetailDialog(user)}
            />
          ))}

          {filtered.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-16 text-muted-foreground"
            >
              No team members found.
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ============================================================ */}
      {/* User Detail Dialog                                            */}
      {/* ============================================================ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback
                      className={cn(
                        "text-lg font-semibold",
                        roleConfig[selectedUser.role].avatarBg
                      )}
                    >
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg">
                      {selectedUser.name}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5">
                      {selectedUser.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Role
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      roleConfig[selectedUser.role].bgColor,
                      roleConfig[selectedUser.role].color,
                      "border"
                    )}
                  >
                    {roleConfig[selectedUser.role].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Department
                  </span>
                  <p className="font-medium">{selectedUser.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        statusConfig[selectedUser.status].dotColor
                      )}
                    />
                    <span className="font-medium capitalize">
                      {statusConfig[selectedUser.status].label}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Last Login
                  </span>
                  <p className="font-medium">
                    {selectedUser.lastLogin
                      ? formatDate(selectedUser.lastLogin)
                      : "Never"}
                  </p>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </span>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
              )}

              {selectedUser.bio && (
                <div className="text-sm">
                  <span className="text-muted-foreground mb-1 block">Bio</span>
                  <p className="text-foreground">{selectedUser.bio}</p>
                </div>
              )}

              <Separator />

              {/* Task history */}
              {(() => {
                const userTasks = getUserTasks(selectedUser.id);
                return (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4" /> Assigned Tasks (
                      {userTasks.length})
                    </h3>
                    {userTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tasks assigned.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due {formatDate(task.dueDate)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize text-xs shrink-0",
                                task.status === "done" &&
                                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                                task.status === "in-progress" &&
                                  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
                                task.status === "in-review" &&
                                  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                                task.status === "todo" &&
                                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              )}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <DialogFooter>
                <Button
                  size="sm"
                  onClick={() => openEditDialog(selectedUser)}
                >
                  Edit User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Edit User Dialog                                              */}
      {/* ============================================================ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update role, department, or status for{" "}
              {selectedUser?.name ?? "this user"}.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Invite User Dialog                                            */}
      {/* ============================================================ */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new team member.
            </DialogDescription>
          </DialogHeader>

          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(onInvite)}
              className="space-y-4"
            >
              <FormField
                control={inviteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jane@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send Invite</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// UserCard
// ---------------------------------------------------------------------------

function UserCard({
  user,
  onClick,
}: {
  user: User;
  onClick: () => void;
}) {
  const role = roleConfig[user.role];
  const status = statusConfig[user.status];
  const taskCount = getTaskCountForUser(user.id);

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow group h-full"
        onClick={onClick}
      >
        <CardContent className="p-5 space-y-4">
          {/* Top: Avatar + Status */}
          <div className="flex items-start justify-between">
            <Avatar className="h-12 w-12">
              <AvatarFallback
                className={cn("text-sm font-semibold", role.avatarBg)}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <span
                className={cn("h-2 w-2 rounded-full", status.dotColor)}
              />
              <span className="text-xs text-muted-foreground">
                {status.label}
              </span>
            </div>
          </div>

          {/* Name & Email */}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 shrink-0" />
              {user.email}
            </p>
          </div>

          {/* Role badge & Department */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn(role.bgColor, role.color, "border text-[10px]")}
            >
              {role.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {user.department}
            </span>
          </div>

          <Separator />

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
            </span>
            <span className="flex items-center gap-1">
              <ListTodo className="h-3 w-3" />
              {taskCount} task{taskCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
