import { Navigate, useParams } from "react-router";
import { useOrganisation } from "@/hooks/use-organisation";
import { getDefaultOrgLanding, orgPath } from "@/lib/org-navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrgIndexRedirect() {
  const { businessMember, isLoading } = useOrganisation();
  const { id: orgId } = useParams();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center p-8">
        <Skeleton className="h-8 w-56" />
      </div>
    );
  }

  const landing = getDefaultOrgLanding(businessMember?.role);
  return <Navigate to={orgPath(orgId, landing)} replace />;
}
