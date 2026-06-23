import { redirect } from "react-router";
import { SITE_NAME } from "types/consts";

export function meta() {
  return [
    { title: `${SITE_NAME}` },
    { name: `description`, content: `Welcome to ${SITE_NAME}!` },
  ];
}

export function loader() {
  return redirect("/dashboard");
}

export default function Home() {
  return null;
}
