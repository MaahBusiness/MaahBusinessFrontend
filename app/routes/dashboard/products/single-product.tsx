import type { Route } from ".react-router/types/app/routes/dashboard/products/+types/single-product";
import { SingleProductActions } from "@/components/products/single-product-actions";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganisation } from "@/hooks/use-organisation";
import { useClipboard } from "@/hooks/useClipboard";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Copy,
  DotIcon,
  LassoSelect,
  TrendingDown,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, redirect, useParams } from "react-router";
import { toast } from "sonner";
import type { ServerActionState, Product } from "types";
import { formatAmount, genericErrorState, getTimeUntilOrSince } from "utils";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Product;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  const intent = formData.get("intent");

  const prodId = formData.get("id") as string | undefined;

  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const code = formData.get("code") as string | undefined;
  const cat = formData.get("cat") as string | undefined;
  const subcat = formData.get("subcat") as string | undefined;
  const _purchase = formData.get("purchase") as string | undefined;
  const _unit = formData.get("unit") as string | undefined;
  const _qty = formData.get("qty") as string | undefined;
  const _min = formData.get("min") as string | undefined;
  const exp = formData.get("exp") as string | undefined;
  const _promo = formData.get("promo") as string | undefined;

  // Converting formatted amounts back to numbers
  const purchase = parseInt(`${_purchase}`.replace(/\D/g, ""), 10) || 0;
  const unit = parseInt(`${_unit}`.replace(/\D/g, ""), 10) || 0;

  // Converting string to actual numbers
  const qty = Number(_qty);
  const min = Number(_min);

  // For comparing the promo dates

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please provide an product name.";
  if (!cat) errors.cat = "Please select a product category.";
  if (purchase <= 0) errors.purchase = "Please provide the purchase price.";
  if (unit <= 0) errors.unit = "Please provide the unit price.";
  else if (unit <= purchase)
    errors.unit = "Selling price must be greater than purchase price";
  if (min >= qty)
    errors.min = "Low threshold should be lower than the initial quantity";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  switch (intent) {
    case "update-product": {
      if (session?.accessToken && prodId)
        return await organisationsApi.updateProduct(
          session.accessToken,
          prodId,
          {
            name: name,
            category_id: cat,
            purchase_price: purchase,
            unit_price: unit,
            barcode: code,
            description: desc,
            expiry_date: exp,
            min_quantity: min > 0 ? min : undefined,
            quantity: qty > 0 ? qty : undefined,
            subcategory_id: subcat,
          },
        );
    }

    default:
      return genericErrorState();
  }
}

export default function SingleproductPage({
  actionData,
}: Route.ComponentProps) {
  const { organisation: orgRes, fetchSingleProduct } = useOrganisation();
  const queryClient = useQueryClient();
  const { prodId, id } = useParams();

  const clipboard = useClipboard({
    resetDelay: 3000,
    onCopy: () => {
      toast.success("Copied successfully!");
      setCopiedBarcode(true);
      setTimeout(() => setCopiedBarcode(false), 2000);
    },
    onError: () => toast.error("Copy was unsuccessful"),
  });

  if (!prodId) return;

  const { data: res, isLoading } = fetchSingleProduct(prodId);

  const [copiedBarcode, setCopiedBarcode] = useState(false);

  const cat = orgRes?.data?.categories?.find(
    (c) => c.id === res?.data?.category_id,
  );
  const sub = cat?.subcategories?.find(
    (s) => s.id === res?.data?.subcategory_id,
  );

  const handleCopy = (text: string) => {
    if (clipboard.isCopying) return;
    clipboard.copy(text);
  };

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        // Automatically refetch products
        queryClient.invalidateQueries({
          queryKey: organisationKeys.prodlist(id),
        });
      queryClient.invalidateQueries({
        queryKey: organisationKeys.product(prodId),
      });
    }
  }, [actionData]);

  if (isLoading) return <SingleSkeleton />;
  if (!res?.success) return <RequestFailed />;
  if (!res.data) return <ProductNotFound />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <Link to="../products">
          <h2 className="text-lg tracking-tight text-muted-foreground">
            Products
          </h2>
        </Link>
        <ChevronRight className="text-muted-foreground size-4" />
        <h2 className="text-lg tracking-tight">{res.data.name}</h2>

        <div className="ml-auto flex items-center justify-end">
          <SingleProductActions data={res.data} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid auto-rows-min gap-6  md:grid-cols-4">
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>QTY in stock</ItemDescription>
            <ItemTitle>
              {formatAmount(`${res.data.quantity}`)}
              {res.data.is_low_stock && (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Unit price</ItemDescription>
            <ItemTitle>XAF {formatAmount(`${res.data.unit_price}`)}</ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Purchase price</ItemDescription>
            <ItemTitle>
              XAF {formatAmount(`${res.data.purchase_price}`)}
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Barcode</ItemDescription>
            <ItemTitle>{res.data.barcode || "--"}</ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Category</ItemDescription>
            <ItemTitle>
              <Link to={`categories/${cat?.id}`} className="hover:underline">
                {cat?.name || "--"}
              </Link>
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>On promotion?</ItemDescription>
            <ItemTitle>
              {res.data.is_expired ? (
                <Check className="size-4 " />
              ) : (
                <X className="size-4 " />
              )}
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Expiration Date</ItemDescription>
            <ItemTitle
              title={new Date(res.data.expiry_date || "").toLocaleString("en", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            >
              {res.data.is_expired ? (
                <span className="text-destructive">Expired</span>
              ) : (
                new Date(res.data?.expiry_date!).toLocaleDateString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              )}
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="p-0">
          <ItemContent className="gap-3">
            <ItemDescription>Last updated</ItemDescription>
            <ItemTitle
              title={new Date(res.data.updated_at).toLocaleString("en", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            >
              {new Date(res.data?.updated_at!).toLocaleDateString("en", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </ItemTitle>
          </ItemContent>
        </Item>
      </div>

      <Separator className="h-px" />

      {/* Dual Cols */}
      <div className="justify-between flex w-full gap-20 ">
        {/* Right Col */}
        <div className="flex items-stretch flex-initial flex-col gap-8 w-full">
          <div className="flex flex-col gap-4">
            <h4 className="scroll-m-20 text-lg tracking-tight">General</h4>

            <Card className="relative w-full p-0 ">
              <CardContent className="flex px-0">
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col gap-1 p-4 border-b ">
                    <h5 className="scroll-m-20 tracking-tight">Product name</h5>
                    <span className=" text-muted-foreground">
                      {res.data.name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-4 border-b ">
                    <h5 className="scroll-m-20 tracking-tight">Description</h5>
                    <span className=" text-muted-foreground">
                      {res.data.description}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-4 border-b ">
                    <h5 className="scroll-m-20 tracking-tight">Category</h5>
                    <Breadcrumb>
                      <BreadcrumbList className="text-xs sm:gap-1.5">
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link
                              to={`../products/categories/${cat?.id}`}
                              relative="route"
                            >
                              {cat?.name}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {sub && (
                          <>
                            <BreadcrumbSeparator>
                              <DotIcon />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                              <BreadcrumbLink asChild>
                                <Link
                                  to={`../products/categories/${cat?.id}/${sub.id}`}
                                >
                                  {sub?.name}
                                </Link>
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                          </>
                        )}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>

                  <div className="flex flex-col gap-2 p-4 border-b ">
                    <h5 className="scroll-m-20  tracking-tight">Product ID</h5>

                    <div className="flex items-center gap-2 relative max-w-82">
                      <code className="px-2 py-1.5 bg-muted rounded-sm text-xs font-mono flex-1 truncate ">
                        {res.data.id}
                      </code>
                      <Button
                        onClick={() => handleCopy(res.data?.id || "")}
                        variant={"secondary"}
                        size={"icon-sm"}
                        className=" h-7 w-8 rounded-sm absolute top-1/2 -translate-y-1/2 right-0"
                        title="Copy ID"
                      >
                        {copiedBarcode ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" />

                <div className="flex flex-col flex-1 p-4 items-start">
                  <img
                    src={
                      res.data.image_url ?? "https://avatar.vercel.sh/shadcn1"
                    }
                    alt="Event cover"
                    className="relative z-20 aspect-auto w-full object-cover brightness-60 grayscale dark:brightness-40 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="scroll-m-20 text-lg tracking-tight">Pricing</h4>

            <Card className="relative w-full p-0 ">
              <CardContent className="flex flex-col px-0">
                {res.data.on_promotion && (
                  <>
                    <div className="p-4">
                      <Item
                        variant="outline"
                        className="bg-muted text-foreground"
                      >
                        <ItemContent className="gap-3">
                          <ItemTitle className="flex items-center gap-2">
                            <BadgeCheckIcon className="size-4" />
                            <span>On Promotion</span>
                            <span className=" text-xs text-muted-foreground  ">
                              (
                              {getTimeUntilOrSince(
                                res.data.promotion_end_date!,
                              )}
                              )
                            </span>
                          </ItemTitle>
                          <ItemDescription className="text-foreground flex justify-between">
                            <div className="flex flex-col gap-1 flex-1">
                              <span className=" text-xs flex items-center gap-2">
                                <span className=" text-xs text-muted-foreground line-through">
                                  XAF {formatAmount(`${res.data.unit_price}`)}
                                </span>
                                {(
                                  ((res?.data?.unit_price -
                                    res.data?.promo_price!) /
                                    res.data?.unit_price) *
                                  100
                                ).toFixed(0)}
                                % OFF
                              </span>
                              <h4 className="scroll-m-20 text-base font-medium tracking-tight">
                                XAF{" "}
                                {formatAmount(`${res.data.promo_price}`)}{" "}
                              </h4>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <span className=" text-xs text-muted-foreground">
                                Started on
                              </span>
                              <span>
                                {new Date(
                                  res.data.promotion_start_date!,
                                ).toLocaleDateString("en", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <span className=" text-xs text-muted-foreground">
                                Ending on
                              </span>
                              <span>
                                {new Date(
                                  res.data.promotion_end_date!,
                                ).toLocaleDateString("en", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </div>

                    <Separator />
                  </>
                )}

                <div className="flex gap-6 p-4">
                  <div className="flex flex-col flex-1 gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                      <h5 className="scroll-m-20 tracking-tight">
                        Purchase Price
                      </h5>
                      <span className=" text-muted-foreground">
                        Cost per item
                      </span>
                    </div>

                    <code className="px-2 py-1.5 bg-muted rounded-sm font-mono flex-1 truncate">
                      XAF {formatAmount(`${res.data.purchase_price}`)}
                    </code>
                  </div>

                  <div className="flex flex-col flex-1 gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                      <h5 className="scroll-m-20 tracking-tight">
                        Unit Price (MSRP)
                      </h5>
                      <span className=" text-muted-foreground">
                        Retail price
                      </span>
                    </div>

                    <code className="px-2 py-1.5 bg-muted rounded-sm font-mono flex-1 truncate">
                      XAF {formatAmount(`${res.data.unit_price}`)}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="scroll-m-20 text-lg tracking-tight">Inventory</h4>

            <HoverCard openDelay={100} closeDelay={100}>
              <Card className="relative w-full p-0 ">
                <CardContent className="flex flex-col px-0">
                  <div className="flex gap-6 p-4">
                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex flex-col flex-1 gap-1">
                        <h5 className="scroll-m-20 tracking-tight">
                          QTY in Stock
                        </h5>
                      </div>

                      <code className="px-2 py-1.5 bg-muted rounded-sm font-mono flex-1 truncate">
                        {res.data.quantity}
                      </code>
                    </div>

                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex flex-col flex-1 gap-1">
                        <h5 className="scroll-m-20 tracking-tight">
                          Stock Threshold
                        </h5>
                      </div>

                      <code className="px-2 py-1.5 bg-muted rounded-sm font-mono flex-1 truncate">
                        {res.data.min_quantity}
                      </code>
                    </div>
                    <div className="flex flex-col flex-1 gap-4">
                      <div className="flex items-center gap-2">
                        <h5 className="scroll-m-20 tracking-tight">Barcode </h5>

                        <HoverCardTrigger asChild>
                          <LassoSelect className="size-3" />
                        </HoverCardTrigger>

                        <HoverCardContent
                          side={"top"}
                          className="p-2 overflow-hidden"
                        >
                          <img
                            src={res.data.barcode_image_url}
                            alt="Barcode image"
                            className="relative  w-full object-cover object-center rounded-sm"
                          />
                        </HoverCardContent>

                        {/* <span className=" text-muted-foreground">
                        Retail price
                      </span> */}
                      </div>

                      <div className="flex items-center gap-2 relative ">
                        <code className="px-2 py-1.5 bg-muted rounded-sm text-xs font-mono flex-1 truncate">
                          {res.data.barcode}
                        </code>
                        <Button
                          onClick={() => handleCopy(res.data?.barcode ?? "")}
                          variant={"secondary"}
                          size={"icon-sm"}
                          className=" h-7 w-8 rounded-sm absolute top-1/2 -translate-y-1/2 right-0"
                          title="Copy Barcode"
                        >
                          {copiedBarcode ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverCard>
          </div>
        </div>

        {/* Right side  */}
        <div className=" max-w-80 w-full  sticky top-4 self-start">
          <div className="flex flex-col gap-4">
            <h4 className="scroll-m-20 text-lg tracking-tight">Timeline</h4>

            <Card className="relative w-full p-0 ">
              <CardContent className="flex flex-col px-0">
                {res.data.expiry_date && (
                  <div className="flex gap-4 p-4 border-b ">
                    <div className="flex flex-col flex-1 gap-1">
                      <h5 className="scroll-m-20 tracking-tight">Expires on</h5>
                    </div>

                    <span className="text-right">
                      {new Date(res.data.expiry_date).toLocaleDateString("en", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex gap-4 p-4 border-b ">
                  <div className="flex flex-col flex-1 gap-1">
                    <h5 className="scroll-m-20 tracking-tight">Last updated</h5>
                  </div>

                  <span className="text-right">
                    {new Date(res.data.updated_at).toLocaleDateString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex gap-4 p-4 ">
                  <div className="flex flex-col flex-1 gap-1">
                    <h5 className="scroll-m-20 tracking-tight">Created</h5>
                  </div>

                  <span className="text-right">
                    {new Date(res.data.created_at).toLocaleDateString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleSkeleton() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <ChevronRight className="text-muted-foreground size-4" />
        <Skeleton className="h-5 w-16" />

        <div className="ml-auto flex items-center justify-end gap-2">
          <Button>
            <Skeleton className="h-2 w-8" />
          </Button>
          <Button variant={"outline"}>
            <Skeleton className="h-2 w-8" />
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="grid auto-rows-min gap-6  md:grid-cols-4">
        {Array.from({ length: 6 }).map((_) => (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-18" />
          </div>
        ))}
      </div>

      <Separator className="h-px" />

      {/* Dual Cols */}
      <div className="justify-between flex w-full gap-20 ">
        {/* Right Col */}
        <div className="flex items-stretch flex-initial flex-col gap-6 w-full">
          {Array.from({ length: 3 }).map((_) => (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>

        {/* Right side  */}
        <div className=" max-w-80 w-full  sticky top-4 self-start gap-8">
          <div className="flex flex-col gap-8">
            {Array.from({ length: 2 }).map((_) => (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductNotFound() {
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
