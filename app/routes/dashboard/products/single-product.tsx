import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/single-product";
import { SingleProductActions } from "@/components/products/single-product-actions";
import { SingleProductDetails } from "@/components/products/single-product-details";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { useProductActionFeedback } from "@/hooks/use-product-action-feedback";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { ChevronLeft, CircleDashed } from "lucide-react";
import { useState } from "react";
import { Link, redirect, useParams } from "react-router";
import { handleProductActions } from "services/api";
import { toast } from "sonner";
import type { ServerActionState, Product } from "types";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Product;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  return await handleProductActions({ formData, id, session });
}

export default function SingleproductPage({
  actionData,
}: Route.ComponentProps) {
  const { organisation: orgRes, fetchSingleProduct } = useOrganisation();
  const { prodId, id } = useParams();
  const [copiedField, setCopiedField] = useState<"id" | "barcode" | null>(null);

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => {
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    },
    onError: () => toast.error("Could not copy to clipboard"),
  });

  if (!prodId) return;

  const { data: res, isLoading, refetch } = fetchSingleProduct(prodId);

  const cat = orgRes?.data?.categories?.find(
    (c) => c.id === res?.data?.category_id,
  );
  const sub = cat?.subcategories?.find(
    (s) => s.id === res?.data?.subcategory_id,
  );

  const handleCopy = (text: string, field: "id" | "barcode") => {
    if (clipboard.isCopying) return;
    setCopiedField(field);
    clipboard.copy(text);
  };

  useProductActionFeedback(actionData, id);

  if (isLoading) return <SingleSkeleton />;
  if (!res?.success) return <RequestFailed refetch={refetch} />;
  if (!res.data) return <ProductNotFound />;

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              to="../products"
              className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-violet-600"
            >
              <ChevronLeft className="size-3.5" />
              Back to catalog
            </Link>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {res.data.name}
            </h1>
            {res.data.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {res.data.description}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <SingleProductActions data={res.data} />
          </div>
        </div>

        <SingleProductDetails
          product={res.data}
          category={cat}
          subcategory={sub}
          onCopy={handleCopy}
          copiedField={copiedField}
        />
      </div>
    </div>
  );
}

function SingleSkeleton() {
  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-3 py-8 sm:px-5 lg:px-6">
        <Skeleton className="mb-4 h-4 w-28" />
        <Skeleton className="mb-6 h-9 w-64" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Separator className="my-6" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <Empty className="p-0 !h-[calc(100svh-var(--header-height))]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleDashed />
        </EmptyMedia>
        <EmptyTitle>We couldn’t find this product</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          The product you’re looking for doesn’t exist or may have been removed.
          Try checking the link or browse other products.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="../products">
          <Button variant="outline">
            <ChevronLeft />
            Back to products
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
