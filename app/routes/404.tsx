import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { CircleSlash, ChevronRight, RefreshCcwIcon } from "lucide-react";
import { genericErrorState } from "utils";

export default function NotFound() {
  return (
    <Empty className="p-0 h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash />
        </EmptyMedia>
        <EmptyTitle className="text-4xl">404</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          The page you&apos;re looking for doesn&apos;t exist or has been moved
          to a new location.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/dashboard">
          <Button>
            <ChevronRight />
            Go to dashboard
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export function RequestFailed({ refetch }: { refetch?: () => Promise<any> }) {
  const navigate = useNavigate();
  return (
    <Empty className="p-0 !h-[calc(100svh-var(--header-height))]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          {genericErrorState().message}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={
            () => (refetch ? refetch() : navigate(0)) // hard refresh current route
          }
        >
          <RefreshCcwIcon />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
