import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  Item,
} from "@/components/ui/item";
import { organisationsApi } from "@/lib/api/organisation";
import { SearchIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";
import type { OrganisationCore } from "types";

export default function LoadedOrganisationsState({
  orgs,
}: {
  orgs: OrganisationCore[];
}) {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Your organisations</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <InputGroup className="w-auto focus-visible:!ring-0">
            <InputGroupInput placeholder="Search organisations..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Button
            size="sm"
            onClick={() =>
              console.log(
                organisationsApi.getFilteredProducts("123", "id123", {
                  category_id: "catid",
                  expired_only: true,
                  low_stock_only: false,
                  name: "tadana",
                  order_by: "current_price",
                  page: 2,
                }),
              )
            }
          >
            <PlusIcon /> Console
          </Button>
          <Link to={"/dashboard/organisations/new"}>
            <Button size="sm">
              <PlusIcon /> New organisation
            </Button>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min gap-4  md:grid-cols-3">
            {orgs.map((org, idx) => (
              <Item
                key={idx}
                variant="outline"
                className="bg-input/50 items-center gap-3 hover:bg-accent border-border"
                asChild
              >
                <Link to={`/dashboard/org/${org.id}`}>
                  <ItemMedia>
                    <Avatar className="size-10">
                      <AvatarImage src={org.logo_url} />
                      <BoringFallback name={org?.name} />
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle>{org.name}</ItemTitle>
                    <ItemDescription className="text-xxs flex gap-1.5">
                      <span>{org.member_count} members</span>
                      <span>·</span>
                      <span>Owner</span>
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
