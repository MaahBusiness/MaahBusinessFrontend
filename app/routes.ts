import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  //auth routes
  index("./routes/home.tsx"),

  layout("routes/auth/layout.tsx", [
    ...prefix("auth", [
      route("signin", "./routes/auth/signin.tsx"),
      route("forgot-password", "./routes/auth/forgot-password.tsx"),
      route("signup", "./routes/auth/signup.tsx"),
    ]),
    route("reset-password", "./routes/auth/reset-password.tsx"),
  ]),

  // Logout route (standalone, no layout)
  // route("signout", "./routes/auth/signout.tsx"),

  route("dashboard", "routes/dashboard/layout.tsx", [
    index("routes/dashboard/index.tsx"), // /dashboard

    route("organisations", "routes/dashboard/organisations/index.tsx", [
      // child routes
      index("routes/dashboard/organisations/home.tsx"),
      route("new", "routes/dashboard/organisations/new.tsx"),
    ]),

    // route("organisations", "routes/dashboard/organisations.tsx"),
    // route("new", "routes/dashboard/new.tsx"),

    layout("routes/dashboard/sidebar-layout.tsx", [
      route("org/:id", "routes/dashboard/org.tsx"),
      route("teams", "routes/dashboard/teams/index.tsx"),
    ]),
    route("*", "routes/dashboard/404.tsx"),
  ]),

  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
