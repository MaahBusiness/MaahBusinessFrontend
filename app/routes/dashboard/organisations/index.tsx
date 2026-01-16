import React from "react";
import { Outlet } from "react-router";

export default function Index() {
  return (
    <div className="h-full overflow-y-auto">
      <Outlet />
    </div>
  );
  // return (
  //     <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
  //       <div className="w-full">
  //         <h1 className="text-2xl font-medium">Your organisations</h1>
  //       </div>

  //       <div className="flex flex-col gap-4">
  //         <div className="flex justify-between gap-4">
  //           <InputGroup className="w-auto focus-visible:!ring-0">
  //             <InputGroupInput placeholder="Search organisations..." />
  //             <InputGroupAddon>
  //               <SearchIcon />
  //             </InputGroupAddon>
  //           </InputGroup>

  //           <Link to={"/dashboard/new"}>
  //             <Button size="sm">
  //               <PlusIcon /> New organisation
  //             </Button>
  //           </Link>
  //         </div>

  //         <div className="flex flex-1 flex-col gap-4">
  //           <div className="grid auto-rows-min gap-4  md:grid-cols-3">
  //             {[1, 2, 3, 4, 5].map((i, idx) => (
  //               <Item
  //                 variant="outline"
  //                 className="bg-input/50 items-center gap-3 hover:bg-accent border-border"
  //                 asChild
  //               >
  //                 <Link to={`/dashboard/org/${idx}`}>
  //                   <ItemMedia>
  //                     <div className="rounded-full bg border border-muted w-8 h-8 flex items-center justify-center flex-shrink-0">
  //                       <BoxesIcon size={18} underlineThickness={0.5} />
  //                     </div>
  //                   </ItemMedia>
  //                   <ItemContent className="gap-0">
  //                     <ItemTitle>Palantir Corp. {i}</ItemTitle>
  //                     <ItemDescription className="text-xxs flex gap-1.5">
  //                       <span>12 members</span>
  //                       <span>·</span>
  //                       <span>Owner</span>
  //                     </ItemDescription>
  //                   </ItemContent>
  //                 </Link>
  //               </Item>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
