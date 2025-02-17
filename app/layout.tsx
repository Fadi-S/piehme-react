import {Navigate, Outlet} from "react-router";
import {getFromLocalStorage} from "~/base/helpers";
import profilePicture from "~/images/defaultPicture.png";
import {useEffect, useRef, useState} from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
    Bars3Icon,
    HomeIcon,
    XMarkIcon,
    PencilIcon,
    CogIcon,
    UserGroupIcon,
    DocumentCheckIcon, PowerIcon, IdentificationIcon
} from '@heroicons/react/24/outline'
import Logo from "~/components/logo";
import {useDispatch} from "react-redux";
import {clearAuth} from "~/features/authentication/authenticationApiSlice";
import {useAppSelector} from "~/base/hooks";

function PrivateRoute () {
    const user = getFromLocalStorage('token');
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Layout() {
    const [navigation, setNavigation] = useState([
        { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
        { name: 'Attendance', href: '/attendance', icon: DocumentCheckIcon, current: false },
        // { name: 'Mosab2at', href: '/quizzes', icon: PencilIcon, current: false },
        { name: 'Controls', href: '/controls', icon: CogIcon, current: false },
    ]);

    const role = useAppSelector((state) => state.auth.role);

    const initialized = useRef(false);

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const username = getFromLocalStorage('username');
    const dispatch = useDispatch();

    function logout() {
        dispatch(clearAuth());

        window.location.href = '/login';
    }

    useEffect(() => {

        if(! initialized.current) {
            initialized.current = true;

            if(role === "ADMIN") {
                navigation.push({ name: 'Icons', href: '/icons', icon: IdentificationIcon, current: false });
                navigation.push({ name: 'Players', href: '/players', icon: UserGroupIcon, current: false });
            }
        }
        setNavigation(navigation.map((item) => {
            item.current = window.location.pathname === item.href;
            return item;
        }));
    }, []);

    return (
        <>
            <div>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>
                            {/* Sidebar component, swap this element with another sidebar if you like */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                                <div className="flex h-16 shrink-0 items-center">
                                    <Logo className="h-8 w-auto" />
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <a
                                                            href={item.href}
                                                            className={classNames(
                                                                item.current
                                                                    ? 'bg-gray-800 text-white'
                                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                            )}
                                                        >
                                                            <item.icon aria-hidden="true" className="size-6 shrink-0"/>
                                                            {item.name}
                                                        </a>
                                                    </li>
                                                ))}

                                                <li key="logout">
                                                    <button
                                                        onClick={logout}
                                                        className='w-full text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                                                    >
                                                        <PowerIcon aria-hidden="true" className="size-6 shrink-0" />
                                                        Logout
                                                    </button>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
                        <div className="flex h-16 shrink-0 items-center">
                            <Logo className="h-8 w-auto"/>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current
                                                            ? 'bg-gray-800 text-white'
                                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                    )}
                                                >
                                                    <item.icon aria-hidden="true" className="size-6 shrink-0"/>
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}

                                        <li key="logout">
                                            <button
                                                onClick={logout}
                                                className='w-full text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'
                                            >
                                                <PowerIcon aria-hidden="true" className="size-6 shrink-0"/>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>

                                <li className="-mx-6 mt-auto">
                                    <a
                                        href="/profile"
                                        className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800"
                                    >
                                        <img
                                            alt=""
                                            src={profilePicture}
                                            className="size-8 rounded-full bg-gray-800"
                                        />
                                        <span className="sr-only">Your profile</span>
                                        <span aria-hidden="true">{username}</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-xs sm:px-6 lg:hidden">
                    <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>
                    <div className="flex-1 text-sm/6 font-semibold text-white">Dashboard</div>
                    <a href="/profile">
                        <span className="sr-only">Your profile</span>
                        <img
                            alt=""
                            src={profilePicture}
                            className="size-8 rounded-full bg-gray-800"
                        />
                    </a>
                </div>

                <main className="py-10 lg:pl-72">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <PrivateRoute />
                    </div>
                </main>
            </div>
        </>
    )
}

