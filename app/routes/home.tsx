import { Navigate } from "react-router";

// export function meta({}: Route.MetaArgs) {
export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Navigate to="dashboard" replace />;
}
