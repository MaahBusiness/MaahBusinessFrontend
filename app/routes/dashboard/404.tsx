import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ChevronLeft, CircleSlash } from "lucide-react";

export default function NotFound() {
  return (
    <Empty className="p-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleSlash />
        </EmptyMedia>
        <EmptyTitle className="text-4xl">404</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          The page you're looking for doesn't exist or has been moved to a new
          location.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="..">
          <Button>
            <ChevronLeft />
            Back to dashboard
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
