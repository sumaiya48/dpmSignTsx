import { dashboardService } from "@/api";
import { StaffProps, useAuth } from "@/hooks/use-auth";
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { ProductProps } from "./use-product";
import { socket } from "@/lib/socket";
import { OrderProps } from "./use-order";

export interface DashboardStatsProps {
	customers: {
		month: string;
		count: number;
	}[];
	products: {
		month: string;
		count: number;
	}[];
	orders: {
		month: string;
		count: number;
	}[];
	earnings: {
		month: string;
		total: number;
	}[];
	topSellingProducts: {
		product: ProductProps & {
			category?: {
				categoryId: number;
				name: string;
			};
		};
		totalQuantity: number;
		totalRevenue: number;
	}[];
	recentOrders: OrderProps[];
	staffs: StaffProps[];
}

export interface DashboardContextProps {
	stats: DashboardStatsProps;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchStats: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextProps | null>(null);

const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
	const [stats, setStats] = useState<DashboardStatsProps>({
		customers: [],
		products: [],
		orders: [],
		earnings: [],
		topSellingProducts: [],
		recentOrders: [],
		staffs: [],
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch stats from the API
	const fetchStats = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) return logout();
			const response = await dashboardService.fetchDashboardStats(authToken);

			setStats(response.data.stats);
		} catch (err: any) {
			setError(err.message || "Failed to fetch dashboard stats.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch stats only when authToken changes
	useEffect(() => {
		fetchStats();
	}, [location]);

	useEffect(() => {
		let debounceTimeout: NodeJS.Timeout;

		const handleNewCustomer = () => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				fetchStats();
			}, 500); // Prevents multiple rapid fetches
		};

		const handleStatusUpdate = () => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => fetchStats(), 500); // 500ms debounce
		};

		socket.on("staff-status-updated", handleStatusUpdate);
		socket.on("register-customer", handleNewCustomer);

		return () => {
			socket.off("register-customer", handleNewCustomer);
			socket.off("staff-status-updated", handleStatusUpdate);
			clearTimeout(debounceTimeout);
		};
	}, []);

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			stats,
			loading,
			setLoading,
			error,
			fetchStats,
		}),
		[stats, loading, error]
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
};

export const useDashboard = () => {
	const context = useContext(DashboardContext);
	if (!context) {
		throw new Error("useDashboard must be used within a DashboardProvider");
	}
	return context;
};

export default DashboardProvider;
