import { useMemo, useState } from "react";
import {
  ChevronRight,
  FolderTree,
  Layers,
  Package,
  Search,
  X,
} from "lucide-react";
import type { Category, Subcategory } from "types";
import { hasPermission } from "utils/permissions";
import { useOrganisation } from "@/hooks/use-organisation";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { SubcategoryFormDialog } from "@/components/categories/subcategory-form-dialog";
import { CategoryItemActions } from "@/components/categories/category-item-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { useParams } from "react-router";

function SubcategoryListItem({
  sub,
  categoryId,
}: {
  sub: Subcategory;
  categoryId: string;
}) {
  const { id: orgId } = useParams();

  return (
    <div className="ml-6 flex h-10 items-center gap-2 rounded-md border border-teal-500/20 bg-teal-500/5 py-1 pl-2.5 pr-2 sm:ml-8 sm:h-11">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15">
        <Layers className="size-3 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <Badge
            variant="outline"
            className="h-4 shrink-0 border-teal-500/30 px-1 text-[9px] text-teal-700 dark:text-teal-300"
          >
            Sub
          </Badge>
          <Link
            to={`/dashboard/org/${orgId}/products/categories/${categoryId}/${sub.id}`}
            className="min-w-0 truncate text-xs font-medium hover:text-teal-600 sm:text-sm"
            title={sub.description || sub.name}
          >
            {sub.name}
          </Link>
        </div>
        {sub.description && (
          <p className="mt-0.5 truncate pl-0.5 text-[10px] text-muted-foreground sm:text-xs">
            {sub.description}
          </p>
        )}
      </div>
      <CategoryItemActions data={sub} compact className="shrink-0" />
    </div>
  );
}

function CategoryListItem({
  category,
  canEdit,
}: {
  category: Category;
  canEdit: boolean;
}) {
  const { id: orgId } = useParams();
  const subs = category.subcategories ?? [];
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-b border-border/50 last:border-b-0">
        <div className="flex h-12 items-center gap-1.5 border-l-[3px] border-l-violet-500 bg-violet-500/[0.04] px-2 sm:h-[52px] sm:gap-2 sm:px-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 shrink-0 text-muted-foreground"
              aria-label={open ? "Collapse subcategories" : "Expand subcategories"}
            >
              <ChevronRight
                className={cn(
                  "size-4 transition-transform",
                  open && "rotate-90",
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 sm:size-8">
            <FolderTree className="size-3.5 text-violet-600 sm:size-4" />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-4 shrink-0 border-violet-500/35 px-1 text-[9px] text-violet-700 dark:text-violet-300"
              >
                Cat
              </Badge>
              <Link
                to={`/dashboard/org/${orgId}/products/categories/${category.id}`}
                className="min-w-0 truncate text-sm font-semibold hover:text-violet-600"
                title={category.description || category.name}
              >
                {category.name}
              </Link>
            </div>
            {category.description && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                {category.description}
              </p>
            )}
          </div>

          <Badge
            variant="secondary"
            className="h-5 shrink-0 bg-violet-500/10 px-1.5 text-[10px] tabular-nums text-violet-700 dark:text-violet-300"
            title="Subcategories count"
          >
            {subs.length} sub
          </Badge>

          <CategoryItemActions data={category} compact className="shrink-0" />
        </div>

        <CollapsibleContent>
          <div className="space-y-1.5 border-t border-violet-500/10 bg-muted/15 px-2 py-2 sm:px-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3">
              <Layers className="size-3 text-teal-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700/80 dark:text-teal-400/80">
                Subcategories
              </span>
              <span className="text-[10px] text-muted-foreground">({subs.length})</span>
            </div>

            {subs.length === 0 ? (
              <p className="px-8 py-1 text-[11px] text-muted-foreground">
                No subcategories in this category
              </p>
            ) : (
              subs.map((sub) => (
                <SubcategoryListItem
                  key={sub.id}
                  sub={sub}
                  categoryId={category.id}
                />
              ))
            )}

            {canEdit && (
              <div className="px-6 pt-0.5 sm:px-8">
                <SubcategoryFormDialog
                  key={`add-sub-${category.id}`}
                  defaultCategoryId={category.id}
                  triggerClassName="h-7 gap-1 border-teal-500/30 px-2 text-xs text-teal-700 hover:bg-teal-500/10 dark:text-teal-300"
                  triggerLabel="Add subcategory"
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function CategoriesBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const { businessMember } = useOrganisation();
  const canEdit = hasPermission(businessMember?.role, "products:crud");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((cat) => {
      const inCat =
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q);
      const inSub = cat.subcategories?.some(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
      return inCat || inSub;
    });
  }, [categories, query]);

  const totalSubs = categories.reduce(
    (n, c) => n + (c.subcategories?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Categories
          </h1>
          <p className="text-xs text-muted-foreground">
            {categories.length} categories · {totalSubs} subcategories
          </p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
              <FolderTree className="size-3" />
              Category
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-teal-500/25 bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-700 dark:text-teal-300">
              <Layers className="size-3" />
              Subcategory
            </span>
          </div>
        </div>

        {canEdit && (
          <CategoryFormDialog triggerClassName="w-full sm:w-auto" />
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="h-9 pl-9 pr-9 text-sm"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-violet-500/25 bg-violet-500/5 px-4 py-10 text-center">
          <Package className="mb-3 size-8 text-violet-600" />
          {categories.length === 0 ? (
            <>
              <p className="text-sm font-semibold">No categories yet</p>
              {canEdit && (
                <div className="mt-4">
                  <CategoryFormDialog />
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">No matches</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setQuery("")}
              >
                Clear search
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-violet-500/15 bg-card/80">
          {filtered.map((cat) => (
            <CategoryListItem
              key={cat.id}
              category={cat}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
