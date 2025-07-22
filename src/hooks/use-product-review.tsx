import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { productReviewService } from "@/api";

export interface ProductReviewProps {
	reviewId: number;
	rating: number;
	description: string;
	status: "published" | "unpublished";
	productId: number;
	customerId: number;
	product: {
		name: string;
	};
	customer: {
		name: string;
		email: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductReviewContextProps {
	reviews: ProductReviewProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "customer-name" | "product-name";
	setSearchBy: React.Dispatch<
		React.SetStateAction<"customer-name" | "product-name">
	>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchReview: () => Promise<void>;
}

const ProductReviewContext = createContext<ProductReviewContextProps | null>(
	null
);

const ProductReviewProvider = ({ children }: { children: React.ReactNode }) => {
	const [reviews, setReviews] = useState<ProductReviewProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchBy, setSearchBy] = useState<"customer-name" | "product-name">(
		"product-name"
	);
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch review from the API
	const fetchReview = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await productReviewService.fetchAllReview(
				authToken,
				searchTerm,
				searchBy,
				page,
				limit
			);

			setReviews(response.data.reviews);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch reviews.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch review on component mount
	useEffect(() => {
		if (authToken) {
			fetchReview();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			reviews,
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
			fetchReview,
		}),
		[reviews, loading, error, searchTerm, page]
	);

	return (
		<ProductReviewContext.Provider value={value}>
			{children}
		</ProductReviewContext.Provider>
	);
};

export const useProductReview = () => {
	const context = useContext(ProductReviewContext);
	if (!context) {
		throw new Error(
			"useProductReview must be used within a ProductReviewProvider"
		);
	}
	return context;
};

export default ProductReviewProvider;
