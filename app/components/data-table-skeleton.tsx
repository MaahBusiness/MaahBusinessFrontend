import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTableSkeleton({
  classname = "min-h-full",
  rows = 10,
}: {
  classname?: string;
  rows?: number;
}) {
  return (
    <div
      className={`w-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12 ${classname}`}
    >
      <div className="w-full flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Skeleton className="h-8 w-[200px] lg:w-[250px]" />

            <Button variant={"outline"}>
              <Skeleton className="h-2 w-8" />
            </Button>
            <Button variant={"outline"}>
              <Skeleton className="h-2 w-8" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant={"outline"}>
              <Skeleton className="h-2 w-8" />
            </Button>
            <Button>
              <Skeleton className="h-2 w-8" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex w-full flex-col gap-2 p-4 rounded-md border border-border">
          {Array.from({ length: rows }).map((_, index) => (
            <div className="flex gap-4" key={index}>
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
