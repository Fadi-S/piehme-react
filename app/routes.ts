import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("./layout.tsx", [
        index("routes/home.tsx"),
    ]),

    layout("./auth/layout.tsx", [
        route("login", "./auth/login.tsx"),
    ]),
] satisfies RouteConfig;
