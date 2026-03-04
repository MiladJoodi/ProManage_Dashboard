"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Users,
  Target,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useProjectStore } from "@/store/project-store";
import { users, tasks } from "@/lib/data";
import type { Project, ProjectStatus } from "@/lib/types";
import {
  cn,
  formatCurrency,
  formatDate,
  getInitials,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "completed", "on-hold", "cancelled"]),
  budget: z.number().min(0, "Budget must be a positive number"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  teamMembers: z.array(z.string()).min(1, "Select at least one team member"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

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

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: "Active",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800",
  },
  completed: {
    label: "Completed",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
  },
  "on-hold": {
    label: "On Hold",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800",
  },
};

function getUserById(id: string) {
  return users.find((u) => u.id === id);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    selectedProject,
    setSelectedProject,
    toggleMilestone,
  } = useProjectStore();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ---- Filtering ----
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [projects, search]);

  // ---- Form ----
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      budget: 0,
      startDate: "",
      endDate: "",
      teamMembers: [],
    },
  });

  function openCreateDialog() {
    setEditingProject(null);
    form.reset({
      name: "",
      description: "",
      status: "active",
      budget: 0,
      startDate: "",
      endDate: "",
      teamMembers: [],
    });
    setFormOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate.slice(0, 10),
      endDate: project.endDate.slice(0, 10),
      teamMembers: project.teamMembers,
    });
    setDetailOpen(false);
    setFormOpen(true);
  }

  function openDetailDialog(project: Project) {
    setSelectedProject(project.id);
    setDetailOpen(true);
  }

  function onSubmit(values: ProjectFormValues) {
    if (editingProject) {
      updateProject(editingProject.id, {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
    } else {
      addProject({
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        progress: 0,
        spent: 0,
        milestones: [],
      });
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setDeleteConfirmOpen(false);
      setDetailOpen(false);
    }
  }

  // ---- Project tasks helper ----
  function getProjectTasks(projectId: string) {
    return tasks.filter((t) => t.projectId === projectId);
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <DashboardLayout>
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[220px]"
            />
          </div>

          <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              className="h-8 px-2.5"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-8 px-2.5"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* ---- Grid / List switch with AnimatePresence ---- */}
      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => openDetailDialog(project)}
              />
            ))}

            {filtered.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="col-span-full text-center py-16 text-muted-foreground"
              >
                No projects found.
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((project) => {
                    const cfg = statusConfig[project.status];
                    return (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer"
                        onClick={() => openDetailDialog(project)}
                      >
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(cfg.bgColor, cfg.color, "border")}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={project.progress}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-9 text-right">
                              {project.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(project.spent)} /{" "}
                          {formatCurrency(project.budget)}
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project.teamMembers.slice(0, 3).map((uid) => {
                              const u = getUserById(uid);
                              return (
                                <Avatar
                                  key={uid}
                                  className="h-7 w-7 border-2 border-background"
                                >
                                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {u ? getInitials(u.name) : "?"}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {project.teamMembers.length > 3 && (
                              <Avatar className="h-7 w-7 border-2 border-background">
                                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                  +{project.teamMembers.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(project.startDate)} &rarr;{" "}
                          {formatDate(project.endDate)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No projects found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* Detail Dialog                                                */}
      {/* ============================================================ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedProject.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedProject.description}
                    </DialogDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      statusConfig[selectedProject.status].bgColor,
                      statusConfig[selectedProject.status].color,
                      "border shrink-0"
                    )}
                  >
                    {statusConfig[selectedProject.status].label}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{selectedProject.progress}%</span>
                </div>
                <Progress value={selectedProject.progress} className="h-2.5" />
              </div>

              {/* Budget & Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Budget
                  </span>
                  <p className="font-medium">
                    {formatCurrency(selectedProject.spent)} /{" "}
                    {formatCurrency(selectedProject.budget)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Timeline
                  </span>
                  <p className="font-medium">
                    {formatDate(selectedProject.startDate)} &rarr;{" "}
                    {formatDate(selectedProject.endDate)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Milestones */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> Milestones (
                  {selectedProject.milestones.filter((m) => m.completed).length}/
                  {selectedProject.milestones.length})
                </h3>
                {selectedProject.milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No milestones yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.milestones.map((ms) => (
                      <label
                        key={ms.id}
                        className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={ms.completed}
                          onCheckedChange={() =>
                            toggleMilestone(selectedProject.id, ms.id)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              ms.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {ms.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(ms.dueDate)}
                          </p>
                        </div>
                        {ms.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Team Members */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Team Members (
                  {selectedProject.teamMembers.length})
                </h3>
                <div className="grid gap-2">
                  {selectedProject.teamMembers.map((uid) => {
                    const u = getUserById(uid);
                    if (!u) return null;
                    return (
                      <div
                        key={uid}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-auto text-xs capitalize">
                          {u.role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Tasks */}
              {(() => {
                const projectTasks = getProjectTasks(selectedProject.id);
                return (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">
                      Tasks ({projectTasks.length})
                    </h3>
                    {projectTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tasks linked to this project.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {projectTasks.map((task) => {
                          const assignee = getUserById(task.assigneeId);
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Assigned to{" "}
                                  {assignee ? assignee.name : "Unknown"} &middot;{" "}
                                  Due {formatDate(task.dueDate)}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize text-xs",
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => openEditDialog(selectedProject)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Delete Confirmation Dialog                                    */}
      {/* ============================================================ */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedProject?.name}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Create / Edit Form Dialog                                     */}
      {/* ============================================================ */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update the project details below."
                : "Fill out the form to create a new project."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status & Budget */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="50000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Team Members (checkboxes) */}
              <FormField
                control={form.control}
                name="teamMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members</FormLabel>
                    <div className="grid gap-2 rounded-lg border p-3 max-h-[200px] overflow-y-auto">
                      {users.map((user) => {
                        const checked = field.value.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) => {
                                if (val) {
                                  field.onChange([...field.value, user.id]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (id: string) => id !== user.id
                                    )
                                  );
                                }
                              }}
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                            <Badge
                              variant="secondary"
                              className="ml-auto text-[10px] capitalize"
                            >
                              {user.role}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProject ? "Save Changes" : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// ProjectCard (Grid item)
// ---------------------------------------------------------------------------

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const cfg = statusConfig[project.status];
  const completedMilestones = project.milestones.filter(
    (m) => m.completed
  ).length;

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow group h-full flex flex-col"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(cfg.bgColor, cfg.color, "border shrink-0 text-[10px]")}
            >
              {cfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Budget
            </span>
            <span className="font-medium">
              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
            </span>
          </div>

          {/* Team */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 4).map((uid) => {
                const u = getUserById(uid);
                return (
                  <Avatar
                    key={uid}
                    className="h-7 w-7 border-2 border-background"
                  >
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {u ? getInitials(u.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {project.teamMembers.length > 4 && (
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                    +{project.teamMembers.length - 4}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              {completedMilestones}/{project.milestones.length} milestones
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.startDate)}
            <ArrowRight className="h-3 w-3 mx-0.5" />
            {formatDate(project.endDate)}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
