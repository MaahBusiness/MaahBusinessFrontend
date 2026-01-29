import { Outlet } from "react-router";

export default function Index() {
  return (
    <div className="h-full overflow-y-auto">
      <Outlet />
    </div>
  );
}
