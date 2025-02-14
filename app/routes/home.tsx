import type {Route} from "./+types/home";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Seyam Kebir Cup"},
    ];
}

export default function Home() {
    return (
        <div>
            <h1>Dashboard</h1>

            <div>Hello World</div>
        </div>
    );
}
