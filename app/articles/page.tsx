"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Clock, User } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { articles } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function ArticlesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof articles)[number] | null
  >(null);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category))),
    []
  );

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        search === "" ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        categoryFilter === "all" || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <DashboardLayout pageTitle="Articles">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Search and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((article) => (
              <motion.div key={article.id} variants={cardVariant}>
                <Card
                  className="flex h-full cursor-pointer flex-col transition-all hover:shadow-md hover:border-primary/30"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime} min read
                      </div>
                    </div>
                    <CardTitle className="mt-2 text-base line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Article Detail Dialog */}
        <Dialog
          open={!!selectedArticle}
          onOpenChange={(open) => !open && setSelectedArticle(null)}
        >
          {selectedArticle && (
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">{selectedArticle.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedArticle.readTime} min read
                  </span>
                </div>
                <DialogTitle className="text-xl">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  {selectedArticle.author} &middot;{" "}
                  {formatDate(selectedArticle.publishedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none py-4">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedArticle.content}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {selectedArticle.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
