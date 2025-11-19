import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("./layout.tsx", [
        index("routes/home.tsx"),
        route("/users/:username", "routes/users-show.tsx"),
        route("/attendance", "./routes/attendance-index.tsx"),

        route("/icons", "./routes/icons/icons-index.tsx"),
        route("/icons/create", "./routes/icons/icons-create.tsx"),
        route("/icons/:iconId/edit", "./routes/icons/icons-edit.tsx"),

        route("/admins", "./routes/admins/admins-index.tsx"),
        route("/admins/create", "./routes/admins/admins-create.tsx"),
        route("/admins/:adminId/edit", "./routes/admins/admins-edit.tsx"),

        route("/prices", "./routes/prices/prices-index.tsx"),
        route("/prices/create", "./routes/prices/prices-create.tsx"),
        route("/prices/:priceId/edit", "./routes/prices/prices-edit.tsx"),

        route("/players", "./routes/players/players-index.tsx"),
        route("/players/create", "./routes/players/players-create.tsx"),
        route("/players/:playerId/edit", "./routes/players/players-edit.tsx"),

        route("/quizzes", "./routes/quizzes/quizzes-index.tsx"),
        route("/quizzes/create", "./routes/quizzes/quizzes-create.tsx"),
        route("/quizzes/:slug/edit", "./routes/quizzes/quizzes-edit.tsx"),
        route("/quizzes/:slug", "./routes/quizzes/quizzes-show.tsx"),

        route("/controls", "./routes/controls.tsx"),
        route("/profile", "./routes/profile.tsx"),
    ]),

    layout("./auth/layout.tsx", [
        route("login", "./auth/login.tsx"),
        route("register", "./auth/register-user.tsx"),
    ]),

    // Security routes - outside authenticated layout
    route("/security-warning", "./routes/security-warning.tsx"),
    route("*", "./routes/catch-all.tsx"),
] satisfies RouteConfig;
