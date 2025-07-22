import { apiStaticURL } from "@/lib/dotenv";
import { socket } from "@/lib/socket";
import routes from "@/routes";
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import urlJoin from "url-join";

export interface AdminProps {
	adminId: number;
	name: string;
	email: string;
	phone: string;
	avatar: string;
	avatarUrl: string | null;
	tokenVersion: number;
	role: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface StaffProps {
	staffId: number;
	name: string;
	email: string;
	phone: string;
	avatar: string;
	avatarUrl: string | null;
	tokenVersion: number;
	role: string;
	commissionPercentage: number;
	designCharge: number | null;
	balance: number;
	status: "online" | "offline";
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export type UserType = AdminProps | StaffProps | null;

export interface AuthContextProps {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	authToken: string | null;
	user: UserType;
	navigateTo: string;
	setNavigateTo: React.Dispatch<React.SetStateAction<string>>;
	login: (
		authToken: string,
		user: AdminProps | StaffProps,
		navigateTo?: string
	) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const navigate = useNavigate();
	const [authToken, setAuthToken] = useState<string | null>(
		localStorage.getItem("authToken") || null
	);
	const [user, setUser] = useState<AdminProps | StaffProps | null>(
		JSON.parse(localStorage.getItem("user") || "null")
	);
	const [loading, setLoading] = useState(true);
	const [navigateTo, setNavigateTo] = useState<string>("");

	useEffect(() => {
		const storedAuthToken = localStorage.getItem("authToken");
		const storedUser = localStorage.getItem("user");

		if (storedAuthToken && storedUser) {
			setAuthToken(storedAuthToken);
			setUser(JSON.parse(storedUser));
		}

		setLoading(false);
	}, []);

	useEffect(() => {
		if (navigateTo) {
			navigate(navigateTo);
		}
	}, [navigateTo]);

	useEffect(() => {
		if (user && "staffId" in user) {
			socket.emit("login-staff", user.staffId);
		}
	}, []);

	const login = (
		authToken: string,
		user: AdminProps | StaffProps,
		navigateTo?: string
	) => {
		if (user && "staffId" in user) {
			socket.emit("login-staff", user.staffId);
		}
		if (!user?.role) user.role = "admin";

		if (user.avatar === "null") {
			user.avatarUrl = null;
		} else {
			if (!user.avatarUrl) {
				user.avatarUrl = urlJoin(apiStaticURL, "/avatars", user.avatar);
			}
		}
		localStorage.setItem("authToken", authToken);
		localStorage.setItem("user", JSON.stringify(user));
		setAuthToken(authToken);
		setUser(user);

		if (navigateTo) {
			setNavigateTo(navigateTo);
		}
	};

	const logout = () => {
		if (user && "staffId" in user) {
			socket.emit("logout-staff", user.staffId);
		}
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
		setAuthToken(null);
		setUser(null);

		// Trigger the storage event manually
		window.dispatchEvent(new Event("storage"));

		// ! FIX ERROR: Reload the page to reset the application state
		// window.location.reload();
		navigate(routes.auth.path);
	};

	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === "authToken" && !event.newValue) {
				// If authToken is removed in another tab, log out in this tab
				logout();
			}
		};

		window.addEventListener("storage", handleStorageChange);

		// Cleanup the event listener on unmount
		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, [logout]);

	const value = useMemo(
		() => ({
			loading,
			setLoading,
			authToken,
			user,
			navigateTo,
			setNavigateTo,
			login,
			logout,
		}),
		[loading, authToken, user]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context as AuthContextProps;
};

export default AuthProvider;
