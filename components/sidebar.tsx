"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  FileBarChart,
  Activity,
  Bell,
  AlertTriangle,
  User,
  Settings,
  Shield,
  HelpCircle,
  BookOpen,
  Newspaper,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Github,
  Linkedin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Projects", href: "/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Products", href: "/products", icon: Package },
      { label: "Orders", href: "/orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Transactions", href: "/transactions", icon: CreditCard },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Reports", href: "/reports", icon: FileBarChart },
      { label: "Activities", href: "/activities", icon: Activity },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Alerts", href: "/alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Security", href: "/security", icon: Shield },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Support", href: "/support", icon: HelpCircle },
      { label: "FAQ", href: "/faq", icon: BookOpen },
      { label: "Articles", href: "/articles", icon: Newspaper },
    ],
  },
];

const sidebarVariants = {
  expanded: {
    width: 264,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  collapsed: {
    width: 72,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const labelVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: "block" as const,
    transition: { duration: 0.2, delay: 0.1 },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transitionEnd: { display: "none" as const },
    transition: { duration: 0.15 },
  },
};

function NavItemLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            variants={labelVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } =
    useUIStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          sidebarCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">PM</span>
        </div>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              variants={labelVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col"
            >
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                ProManage
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Dashboard
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8 lg:hidden"
          onClick={toggleSidebar}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider>
          <nav className="flex flex-col gap-1">
            {navGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {groupIndex > 0 && (
                  <Separator className="my-3 opacity-50" />
                )}
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.p
                      variants={labelVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                    >
                      {group.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavItemLink
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href}
                      collapsed={sidebarCollapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {/* Collapse Toggle - desktop only */}
        <div className="hidden lg:block">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "mb-2 w-full text-muted-foreground hover:text-foreground",
                    sidebarCollapsed && "px-2"
                  )}
                  onClick={toggleSidebarCollapsed}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <motion.span
                        variants={labelVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="text-xs"
                      >
                        Collapse
                      </motion.span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right" sideOffset={12}>
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Logout Button */}
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  sidebarCollapsed ? "px-2" : "justify-start gap-3"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      variants={labelVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="text-sm"
                    >
                      Log out
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right" sideOffset={12}>
                Log out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Social Links */}
        <div className={cn(
          "flex items-center gap-1 pt-2 border-t border-sidebar-border",
          sidebarCollapsed ? "flex-col" : "justify-center"
        )}>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/MiladJoodi/ProManage_Dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent side={sidebarCollapsed ? "right" : "top"} sideOffset={8}>
                GitHub
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href="https://www.linkedin.com/in/joodi/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent side={sidebarCollapsed ? "right" : "top"} sideOffset={8}>
                LinkedIn
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar-background lg:block"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={toggleSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-sidebar-border bg-sidebar-background lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
