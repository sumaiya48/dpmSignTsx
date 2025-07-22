import { newsletterService } from "@/api";
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

export interface NewsletterProps {
	newsletterId: number;
	email: string;
	verified: boolean;
	verificationToken: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NewsletterContextProps {
	newsletters: NewsletterProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchNewsletters: () => Promise<void>;
}

const NewsletterContext = createContext<NewsletterContextProps | null>(null);

const NewsletterProvider = ({ children }: { children: React.ReactNode }) => {
	const [newsletters, setNewsletters] = useState<NewsletterProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch newsletters from API
	const fetchNewsletters = async () => {
		if (loading || !authToken) return;
		setLoading(true);
		setError(null);

		try {
			const response = await newsletterService.fetchAllNewsletter(
				authToken,
				searchTerm,
				page,
				limit
			);

			setNewsletters(response.data.subscribers);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch newsletters.");
			if (err.status === 401) logout();
		} finally {
			setLoading(false);
		}
	};

	// Fetch on mount & location change
	useEffect(() => {
		if (authToken) fetchNewsletters();
	}, [authToken, location, searchTerm, page]);

	// Subscribe to real-time updates
	useEffect(() => {
		const handleNewsletterUpdate = () => {
			fetchNewsletters();
		};

		socket.on("subscribe-newsletter", handleNewsletterUpdate);

		// Cleanup function to remove event listener when component unmounts
		return () => {
			socket.off("subscribe-newsletter", handleNewsletterUpdate);
		};
	}, [fetchNewsletters]);

	// Memoize context value
	const value = useMemo(
		() => ({
			newsletters,
			searchTerm,
			setSearchTerm,
			totalPages,
			page,
			setPage,
			loading,
			setLoading,
			error,
			fetchNewsletters,
		}),
		[newsletters, loading, error, searchTerm, page]
	);

	return (
		<NewsletterContext.Provider value={value}>
			{children}
		</NewsletterContext.Provider>
	);
};

// Custom hook
export const useNewsletter = () => {
	const context = useContext(NewsletterContext);
	if (!context) {
		throw new Error("useNewsletter must be used within a NewsletterProvider");
	}
	return context;
};

export default NewsletterProvider;
