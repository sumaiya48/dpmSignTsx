import { inqueryService } from "@/api";
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
import { apiStaticURL } from "@/lib/dotenv";
import urlJoin from "url-join";

export interface InqueryImageProps {
	imageId: number;
	imageName: string;
	imageUrl: string;
	inqueryId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface InqueryProps {
	inqueryId: number;
	name: string;
	email: string;
	phone: string;
	company: string;
	inqueryType: string;
	message: string;
	images: InqueryImageProps[];
	status: "open" | "closed";
	createdAt: Date;
	updatedAt: Date;
}

export interface InqueryContextProps {
	inqueries: InqueryProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "name" | "email" | "phone";
	setSearchBy: React.Dispatch<React.SetStateAction<"name" | "email" | "phone">>;
	inqueryType:
		| "all"
		| "product-information"
		| "pricing"
		| "customization-options"
		| "others";
	setInqueryType: React.Dispatch<
		React.SetStateAction<
			| "all"
			| "product-information"
			| "pricing"
			| "customization-options"
			| "others"
		>
	>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchInqueries: () => Promise<void>;
}

const InqueryContext = createContext<InqueryContextProps | null>(null);

const InqueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [inqueries, setInqueries] = useState<InqueryProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchBy, setSearchBy] = useState<"name" | "email" | "phone">("name");
	const [inqueryType, setInqueryType] = useState<
		| "all"
		| "product-information"
		| "pricing"
		| "customization-options"
		| "others"
	>("all");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch inqueries from the API
	const fetchInqueries = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await inqueryService.fetchAllInquery(
				authToken,
				searchTerm,
				searchBy,
				inqueryType,
				page,
				limit
			);

			const updatedInqueries = response.data.inqueries.map(
				(item: InqueryProps) => ({
					...item,
					images:
						item.images?.map((image) => ({
							...image,
							imageUrl: urlJoin(apiStaticURL, "/inqueries", image.imageName),
						})) || [],
				})
			);

			setInqueries(updatedInqueries);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch inqueries.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch inqueries on component mount
	useEffect(() => {
		if (authToken) {
			fetchInqueries();
		}
	}, [authToken, location, searchTerm, page, inqueryType]);

	socket.on("create-inquery", () => {
		fetchInqueries();
	});

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			inqueries,
			searchTerm,
			setSearchTerm,
			searchBy,
			setSearchBy,
			inqueryType,
			setInqueryType,
			page,
			setPage,
			totalPages,
			loading,
			setLoading,
			error,
			fetchInqueries,
		}),
		[inqueries, loading, searchTerm, page, inqueryType, error]
	);

	return (
		<InqueryContext.Provider value={value}>{children}</InqueryContext.Provider>
	);
};

export const useInquery = () => {
	const context = useContext(InqueryContext);
	if (!context) {
		throw new Error("useInquery must be used within a InqueryProvider");
	}
	return context;
};

export default InqueryProvider;
