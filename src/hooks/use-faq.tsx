import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { faqService } from "@/api";

export interface FaqProps {
	faqId: number;
	faqTitle: string;
	faqItems: FaqItemProps[];
	createdAt: Date;
	updatedAt: Date;
}

export interface FaqItemProps {
	faqItemId: number;
	faqId: number;
	question: string;
	answer: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface FaqContextProps {
	faqs: FaqProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchFaqs: () => Promise<void>;
}

const FaqContext = createContext<FaqContextProps | null>(null);

const FaqProvider = ({ children }: { children: React.ReactNode }) => {
	const [faqs, setFaqs] = useState<FaqProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch faqs from the API
	const fetchFaqs = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await faqService.fetchAllFaq(
				authToken,
				searchTerm,
				page,
				limit
			);
			setFaqs(response.data.faqs);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch faqs.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch faqs on component mount
	useEffect(() => {
		if (authToken) {
			fetchFaqs();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			faqs,
			searchTerm,
			setSearchTerm,
			page,
			setPage,
			totalPages,
			loading,
			setLoading,
			error,
			fetchFaqs,
		}),
		[faqs, loading, searchTerm, page, error]
	);

	return <FaqContext.Provider value={value}>{children}</FaqContext.Provider>;
};

export const useFaqs = () => {
	const context = useContext(FaqContext);
	if (!context) {
		throw new Error("useFaqs must be used within a FaqProvider");
	}
	return context;
};

export default FaqProvider;
