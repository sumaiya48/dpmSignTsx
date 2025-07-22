import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { courierService } from "@/api";

export interface CourierProps {
	courierId: number;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CourierContextProps {
	couriers: CourierProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchCouriers: () => Promise<void>;
}

const CourierContext = createContext<CourierContextProps | null>(null);

const CourierProvider = ({ children }: { children: React.ReactNode }) => {
	const [couriers, setCouriers] = useState<CourierProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch couriers from the API
	const fetchCouriers = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await courierService.fetchAllCourier(
				authToken,
				searchTerm,
				page,
				limit
			);

			setCouriers(response.data.couriers);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch couriers.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch courier on component mount
	useEffect(() => {
		if (authToken) {
			fetchCouriers();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			couriers,
			searchTerm,
			setSearchTerm,
			totalPages,
			page,
			setPage,
			loading,
			setLoading,
			error,
			fetchCouriers,
		}),
		[couriers, loading, error, searchTerm, page]
	);

	return (
		<CourierContext.Provider value={value}>{children}</CourierContext.Provider>
	);
};

export const useCouriers = () => {
	const context = useContext(CourierContext);
	if (!context) {
		throw new Error("useCouriers must be used within a CourierProvider");
	}
	return context;
};

export default CourierProvider;
