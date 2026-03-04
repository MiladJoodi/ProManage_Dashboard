"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Key,
  Webhook,
  Download,
  Activity,
  Database,
  FileText,
  Copy,
  RefreshCw,
  Send,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function ToolsPage() {
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookPayload, setWebhookPayload] = useState('{"event": "test"}');
  const [exportFormat, setExportFormat] = useState("json");

  const systemServices = [
    { name: "API Server", status: "operational", uptime: 99.9 },
    { name: "Database", status: "operational", uptime: 99.8 },
    { name: "Storage", status: "degraded", uptime: 98.5 },
    { name: "CDN", status: "operational", uptime: 99.99 },
  ];

  const logEntries = [
    { time: "09:30:12", level: "INFO", message: "API request processed - GET /api/projects" },
    { time: "09:29:58", level: "WARN", message: "Rate limit approaching for client api-key-xyz" },
    { time: "09:29:45", level: "INFO", message: "User login successful - user-1" },
    { time: "09:28:30", level: "ERROR", message: "Failed to connect to cache server, retrying..." },
    { time: "09:28:12", level: "INFO", message: "Scheduled backup started" },
  ];

  function handleGenerateKey() {
    const key = `sk_live_${Array.from({ length: 32 }, () =>
      "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
    ).join("")}`;
    setApiKey(key);
    toast.success("API key generated");
  }

  function handleCopyKey() {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard");
  }

  function handleTestWebhook() {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    toast.success("Webhook test sent", {
      description: `POST request sent to ${webhookUrl}`,
    });
  }

  function handleExportData() {
    toast.success(`Export started (${exportFormat.toUpperCase()})`, {
      description: "Your data export is being prepared.",
    });
  }

  function handleClearCache() {
    toast.success("Cache cleared", {
      description: "All cached data has been purged successfully.",
    });
  }

  return (
    <DashboardLayout pageTitle="Developer Tools">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* API Key Generator */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-5 w-5 text-amber-500" />
                API Key Generator
              </CardTitle>
              <CardDescription>
                Generate API keys for authentication with our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  readOnly
                  placeholder="Click generate to create an API key"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!apiKey}
                  onClick={handleCopyKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleGenerateKey} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Key
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Webhook Tester */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-5 w-5 text-blue-500" />
                Webhook Tester
              </CardTitle>
              <CardDescription>
                Test your webhook endpoints with sample payloads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-api.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payload">Payload (JSON)</Label>
                <Input
                  id="payload"
                  value={webhookPayload}
                  onChange={(e) => setWebhookPayload(e.target.value)}
                  placeholder='{"event": "test"}'
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={handleTestWebhook} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Test
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Export */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5 text-green-500" />
                Data Export
              </CardTitle>
              <CardDescription>
                Export your data in various formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportData} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Data ({exportFormat.toUpperCase()})
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-purple-500" />
                System Status
              </CardTitle>
              <CardDescription>
                Current status of platform services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          service.status === "operational"
                            ? "bg-green-500"
                            : service.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        )}
                      />
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          service.status === "operational"
                            ? "text-green-600 dark:text-green-400"
                            : service.status === "degraded"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {service.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-14 text-right">
                        {service.uptime}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cache Manager */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5 text-orange-500" />
                Cache Manager
              </CardTitle>
              <CardDescription>
                Manage application cache and storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Cache Usage</span>
                  <span className="text-muted-foreground">127 MB / 512 MB</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Storage Used</span>
                  <span className="text-muted-foreground">2.4 GB / 10 GB</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Log Viewer */}
        <motion.div variants={cardVariant}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-cyan-500" />
                Log Viewer
              </CardTitle>
              <CardDescription>
                Recent application logs and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs space-y-1.5 max-h-[200px] overflow-y-auto">
                {logEntries.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {entry.time}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 w-12",
                        entry.level === "INFO" && "text-blue-500",
                        entry.level === "WARN" && "text-yellow-500",
                        entry.level === "ERROR" && "text-red-500"
                      )}
                    >
                      [{entry.level}]
                    </span>
                    <span className="text-foreground break-all">
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
