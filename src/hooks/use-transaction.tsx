import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { transactionService } from "@/api";

export interface TransactionProps {
	id: number;
	transactionId: string;
	orderId: number;
	valId: string;
	amount: string;
	storeAmount: string;
	cardType: string;
	bankTransactionId: string;
	status: string;
	transactionDate: Date;
	currency: string;
	cardIssuer: string;
	cardBrand: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface TransactionContextProps {
	transactions: TransactionProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextProps | null>(null);

const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
	const [transactions, setTransactions] = useState<TransactionProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch transactions from the API
	const fetchTransactions = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await transactionService.fetchAllTransaction(
				authToken,
				searchTerm,
				page,
				limit
			);

			console.log(response);
			setTransactions(response.data.transactions);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch transactions.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch transactions on component mount
	useEffect(() => {
		if (authToken) {
			fetchTransactions();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			transactions,
			searchTerm,
			setSearchTerm,
			totalPages,
			page,
			setPage,
			loading,
			setLoading,
			error,
			fetchTransactions,
		}),
		[transactions, loading, error, searchTerm, page]
	);

	return (
		<TransactionContext.Provider value={value}>
			{children}
		</TransactionContext.Provider>
	);
};

export const useTransactions = () => {
	const context = useContext(TransactionContext);
	if (!context) {
		throw new Error(
			"useTransactions must be used within a TransactionProvider"
		);
	}
	return context;
};

export default TransactionProvider;
