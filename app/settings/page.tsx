"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Settings,
  Globe,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  Save,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function SettingsPage() {
  // General settings
  const [appName, setAppName] = useState("ProManage");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc-8");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [compactMode, setCompactMode] = useState(false);

  function handleSaveGeneral() {
    toast.success("General settings saved", {
      description: "Your general preferences have been updated.",
    });
  }

  function handleSaveNotifications() {
    toast.success("Notification settings saved", {
      description: "Your notification preferences have been updated.",
    });
  }

  function handleSaveAppearance() {
    toast.success("Appearance settings saved", {
      description: "Your appearance preferences have been updated.",
    });
  }

  function handleExportData() {
    toast.success("Export started", {
      description: "Your data export is being prepared. You will be notified when ready.",
    });
  }

  function handleClearCache() {
    toast.success("Cache cleared", {
      description: "Application cache has been cleared successfully.",
    });
  }

  return (
    <DashboardLayout pageTitle="Settings">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4 hidden sm:block" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4 hidden sm:block" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4 hidden sm:block" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your application preferences and regional settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Application name"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will appear in the sidebar and browser tab.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-12">UTC-12:00 (Baker Island)</SelectItem>
                        <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                        <SelectItem value="utc-7">UTC-07:00 (Mountain Time)</SelectItem>
                        <SelectItem value="utc-6">UTC-06:00 (Central Time)</SelectItem>
                        <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                        <SelectItem value="utc+0">UTC+00:00 (London)</SelectItem>
                        <SelectItem value="utc+1">UTC+01:00 (Berlin, Paris)</SelectItem>
                        <SelectItem value="utc+8">UTC+08:00 (Beijing, Singapore)</SelectItem>
                        <SelectItem value="utc+9">UTC+09:00 (Tokyo, Seoul)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveGeneral}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email.
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser.
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when tasks you follow are updated.
                      </p>
                    </div>
                    <Switch
                      checked={taskUpdates}
                      onCheckedChange={setTaskUpdates}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone mentions you.
                      </p>
                    </div>
                    <Switch
                      checked={mentions}
                      onCheckedChange={setMentions}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of activity.
                      </p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent",
                            theme === t
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full",
                              t === "light" && "bg-white border border-border",
                              t === "dark" && "bg-zinc-900 border border-zinc-700",
                              t === "system" &&
                                "bg-gradient-to-br from-white to-zinc-900 border border-border"
                            )}
                          />
                          <span className="text-sm font-medium capitalize">
                            {t}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use smaller spacing and font sizes.
                      </p>
                    </div>
                    <Switch
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export your data or manage application storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Export Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Download all your data as a JSON file.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Clear Cache</Label>
                      <p className="text-sm text-muted-foreground">
                        Clear locally cached data and refresh.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleClearCache}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
