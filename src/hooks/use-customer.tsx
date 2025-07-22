import { customerService } from "@/api";
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { socket } from "@/lib/socket";

export interface CustomerProps {
	customerId: number;
	name: string;
	email: string;
	phone: string;
	billingAddress: string;
	shippingAddress: string;
	tokenVersion: number;
	verified: boolean;
	verificationToken: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CustomerContextProps {
	customers: CustomerProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "name" | "email" | "phone";
	setSearchBy: React.Dispatch<React.SetStateAction<"name" | "email" | "phone">>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchCustomers: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextProps | null>(null);

const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
	const [customers, setCustomers] = useState<CustomerProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchBy, setSearchBy] = useState<"name" | "email" | "phone">("name");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch customers from the API
	const fetchCustomers = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await customerService.fetchAllCustomer(
				authToken,
				searchTerm,
				searchBy,
				page,
				limit
			);
			setCustomers(response.data.customers);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch customers.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch customers on component mount
	useEffect(() => {
		if (authToken) {
			fetchCustomers();
		}
	}, [authToken, location, searchTerm, page, limit]);

	useEffect(() => {
		let debounceTimeout: NodeJS.Timeout;

		const handleNewCustomer = () => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				fetchCustomers();
			}, 500); // Prevents multiple rapid fetches
		};

		socket.on("register-customer", handleNewCustomer);

		return () => {
			socket.off("register-customer", handleNewCustomer);
			clearTimeout(debounceTimeout);
		};
	}, []);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			customers,
			searchTerm,
			setSearchTerm,
			searchBy,
			setSearchBy,
			totalPages,
			page,
			setPage,
			loading,
			setLoading,
			error,
			fetchCustomers,
		}),
		[customers, loading, error, searchTerm, page, limit]
	);

	return (
		<CustomerContext.Provider value={value}>
			{children}
		</CustomerContext.Provider>
	);
};

export const useCustomer = () => {
	const context = useContext(CustomerContext);
	if (!context) {
		throw new Error("useCustomer must be used within a CustomerProvider");
	}
	return context;
};

export default CustomerProvider;
