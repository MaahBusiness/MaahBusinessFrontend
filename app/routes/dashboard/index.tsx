import { Navigate } from "react-router";

// export async function loader({ request }: Route.LoaderArgs) {
//   const { user, headers } = await requireUserSession(request);

//   if (!user) {
//     throw redirect("/auth/signup");
//   }

//   return data(
//     { user },
//     { headers } // <- important!
//   );
// }

export default function Dashboard() {
  return <Navigate to="organisations" replace />;
}
