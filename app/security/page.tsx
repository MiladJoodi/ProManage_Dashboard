"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const activeSessions = [
  {
    id: "session-1",
    device: "Chrome on Windows",
    icon: Monitor,
    location: "San Francisco, CA",
    ip: "192.168.1.1",
    lastActive: "2026-03-04T09:30:00Z",
    current: true,
  },
  {
    id: "session-2",
    device: "Safari on iPhone",
    icon: Smartphone,
    location: "San Francisco, CA",
    ip: "192.168.1.15",
    lastActive: "2026-03-04T08:00:00Z",
    current: false,
  },
  {
    id: "session-3",
    device: "Firefox on macOS",
    icon: Globe,
    location: "New York, NY",
    ip: "10.0.0.45",
    lastActive: "2026-03-03T14:22:00Z",
    current: false,
  },
];

const loginHistory = [
  { date: "2026-03-04T09:30:00Z", device: "Chrome on Windows", ip: "192.168.1.1", location: "San Francisco, CA", status: "success" },
  { date: "2026-03-04T08:00:00Z", device: "Safari on iPhone", ip: "192.168.1.15", location: "San Francisco, CA", status: "success" },
  { date: "2026-03-03T14:22:00Z", device: "Firefox on macOS", ip: "10.0.0.45", location: "New York, NY", status: "success" },
  { date: "2026-03-03T06:15:00Z", device: "Unknown Browser", ip: "203.0.113.42", location: "Unknown", status: "failed" },
  { date: "2026-03-02T18:45:00Z", device: "Chrome on Windows", ip: "192.168.1.1", location: "San Francisco, CA", status: "success" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showTwoFADialog, setShowTwoFADialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmitPassword(data: PasswordFormValues) {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Password updated", {
      description: "Your password has been changed successfully.",
    });
    form.reset();
    setIsLoading(false);
  }

  function handleToggleTwoFA(checked: boolean) {
    if (checked) {
      setShowTwoFADialog(true);
    } else {
      setTwoFAEnabled(false);
      toast.success("Two-factor authentication disabled");
    }
  }

  function handleConfirmTwoFA() {
    setTwoFAEnabled(true);
    setShowTwoFADialog(false);
    toast.success("Two-factor authentication enabled", {
      description: "Your account is now more secure.",
    });
  }

  function handleRevokeSession(id: string) {
    toast.success("Session revoked", {
      description: "The session has been terminated.",
    });
  }

  function handleDeleteAccount() {
    setShowDeleteDialog(false);
    toast.error("Account deletion requested", {
      description: "Your account will be deleted in 30 days.",
    });
  }

  return (
    <DashboardLayout pageTitle="Security">
      <div className="space-y-6">
        {/* Change Password */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              disabled={isLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              tabIndex={-1}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                disabled={isLoading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                tabIndex={-1}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">
                    {twoFAEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {twoFAEnabled
                      ? "Your account is protected with two-factor authentication."
                      : "Enable two-factor authentication for enhanced security."}
                  </p>
                </div>
                <Switch
                  checked={twoFAEnabled}
                  onCheckedChange={handleToggleTwoFA}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-FA Setup Dialog */}
        <Dialog open={showTwoFADialog} onOpenChange={setShowTwoFADialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code below with your authenticator app, then enter the verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="verifyCode">Verification Code</Label>
                <Input id="verifyCode" placeholder="Enter 6-digit code" maxLength={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTwoFADialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmTwoFA}>
                Enable 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Active Sessions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices and sessions signed into your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => {
                  const Icon = session.icon;
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.location} &middot; {session.ip} &middot;{" "}
                            {formatDateTime(session.lastActive)}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Login History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Recent sign-in activity for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">
                        {formatDateTime(entry.date)}
                      </TableCell>
                      <TableCell className="text-sm">{entry.device}</TableCell>
                      <TableCell className="text-sm font-mono">
                        {entry.ip}
                      </TableCell>
                      <TableCell className="text-sm">{entry.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.status === "success" ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all of your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
