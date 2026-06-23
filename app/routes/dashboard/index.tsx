import { redirect } from "react-router";

export function loader() {
  return redirect("/dashboard/organisations");
}

export default function Dashboard() {
  return null;
}
