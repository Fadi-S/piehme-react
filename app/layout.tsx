import {Navigate, Outlet} from "react-router";
import {getFromLocalStorage} from "~/base/helpers";

function PrivateRoute () {
    const user = getFromLocalStorage('token');
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppLayout() {
    return (
        <div>
            <PrivateRoute />
        </div>
    );
}
