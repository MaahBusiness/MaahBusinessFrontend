import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, Sparkles, Library } from "lucide-react";
import { Link } from "react-router";

export default function EmptyOrganisationsState() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center flex flex-col items-center gap-8">
          <h2 className="text-foreground text-1xl md:text-2xl font-bold tracking-tight mb-8">
            No organisations yet
          </h2>

          {/* Icon with decorative elements */}
          <div className="relative inline-flex">
            {/* Background blur circles */}
            <div className="absolute inset-0 -m-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main icon container */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border dark:border-muted flex items-center justify-center">
                <Library className="w-12 h-12 text-primary" strokeWidth={1.5} />
              </div>

              {/* Floating accent icon */}
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-3">
            <p className="text-md text-muted-foreground max-w-md mx-auto">
              Organisations help you manage teams, projects, finances, and
              performance — all in one place.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col gap-2">
            <Link to={"/dashboard/organisations/new"}>
              <Button>
                <Plus className="w-5 h-5" />
                Create Organisation
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              You can invite teammates after creating one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
