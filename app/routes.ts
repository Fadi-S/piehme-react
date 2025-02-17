import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("./layout.tsx", [
        index("routes/home.tsx"),
        route("/users/:username", "routes/users-show.tsx"),
        route("/quizzes", "./routes/quizzes-index.tsx"),
        route("/attendance", "./routes/attendance-index.tsx"),

        route("/icons", "./routes/icons/icons-index.tsx"),
        route("/icons/create", "./routes/icons/icons-create.tsx"),
        route("/icons/:name/edit", "./routes/icons/icons-edit.tsx"),


        route("/controls", "./routes/controls.tsx"),
        route("/profile", "./routes/profile.tsx"),
    ]),

    layout("./auth/layout.tsx", [
        route("login", "./auth/login.tsx"),
    ]),
] satisfies RouteConfig;
