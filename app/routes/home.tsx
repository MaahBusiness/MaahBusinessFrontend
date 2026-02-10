import { Navigate } from "react-router";
import { SITE_NAME } from "types/consts";

// export function meta({}: Route.MetaArgs) {
export function meta() {
  return [
    { title: `${SITE_NAME}` },
    { name: `description`, content: `Welcome to ${SITE_NAME}!` },
  ];
}

export default function Home() {
  return <Navigate to="dashboard" replace />;
}
