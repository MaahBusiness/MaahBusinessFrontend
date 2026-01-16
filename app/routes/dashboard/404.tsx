import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-max flex items-center justify-center p-4">
      <div className="max-w-2xl w-full h-full text-center space-y-4">
        <div className="relative">
          <h1 className="text-8xl font-bold leading-none select-none">404</h1>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a new
            location.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/dashboard"> Dashboard </Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary/5 blur-2xl -z-10" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
      </div>
    </div>
  );
}
