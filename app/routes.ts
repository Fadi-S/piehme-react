import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("./layout.tsx", [
        index("routes/home.tsx"),
        route("/users/:username", "routes/users-show.tsx"),
        route("/quizzes", "./routes/quizzes-index.tsx"),
        route("/attendance", "./routes/attendance-index.tsx"),
        route("/controls", "./routes/controls.tsx"),
        route("/profile", "./routes/profile.tsx"),
    ]),

    layout("./auth/layout.tsx", [
        route("login", "./auth/login.tsx"),
    ]),
] satisfies RouteConfig;
