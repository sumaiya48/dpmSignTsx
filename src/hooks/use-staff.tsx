import { staffService } from "@/api";
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { StaffProps, useAuth } from "@/hooks/use-auth";
import { apiStaticURL } from "@/lib/dotenv";
import urlJoin from "url-join";
import { socket } from "@/lib/socket";

export interface StaffContextProps {
	staff: StaffProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "name" | "email" | "phone";
	setSearchBy: React.Dispatch<React.SetStateAction<"name" | "email" | "phone">>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	showDeleted: boolean;
	setShowDeleted: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchStaff: () => Promise<void>;
}

const StaffContext = createContext<StaffContextProps | null>(null);

const StaffProvider = ({ children }: { children: React.ReactNode }) => {
	const [staff, setStaff] = useState<StaffProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [showDeleted, setShowDeleted] = useState<boolean>(false);
	const [searchBy, setSearchBy] = useState<"name" | "email" | "phone">("name");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch staff from the API
	const fetchStaff = async () => {
		if (!authToken || loading) return;

		setLoading(true);
		setError(null);

		try {
			const response = await staffService.fetchAllStaff(
				authToken,
				searchTerm,
				searchBy,
				page,
				limit
			);
			const updatedStaff = response.data.staff.map((staffItem: StaffProps) => ({
				...staffItem,
				avatarUrl:
					staffItem.avatar !== "null"
						? urlJoin(apiStaticURL, "/avatars", staffItem.avatar)
						: null,
			}));
			if (!showDeleted) {
				setStaff(
					updatedStaff.filter((staffItem: StaffProps) => !staffItem.isDeleted)
				);
			} else {
				setStaff(updatedStaff);
			}
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch staff.");
			if (err.status === 401) logout();
		} finally {
			setLoading(false);
		}
	};

	// Fetch staff on mount and when authToken/location changes
	useEffect(() => {
		if (authToken) fetchStaff();
	}, [authToken, location, searchTerm, page, showDeleted]);

	// Debounced WebSocket listener using setTimeout
	useEffect(() => {
		let debounceTimer: NodeJS.Timeout;

		const handleStatusUpdate = () => {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => fetchStaff(), 500); // 500ms debounce
		};

		socket.on("staff-status-updated", handleStatusUpdate);

		return () => {
			socket.off("staff-status-updated", handleStatusUpdate);
			clearTimeout(debounceTimer); // Cleanup pending calls
		};
	}, []);

	// Memoized context value
	const value = useMemo(
		() => ({
			staff,
			searchTerm,
			setSearchTerm,
			searchBy,
			setSearchBy,
			totalPages,
			page,
			setPage,
			loading,
			showDeleted,
			setShowDeleted,
			setLoading,
			error,
			fetchStaff,
		}),
		[staff, loading, searchTerm, page, error, showDeleted]
	);

	return (
		<StaffContext.Provider value={value}>{children}</StaffContext.Provider>
	);
};

export const useStaff = () => {
	const context = useContext(StaffContext);
	if (!context) {
		throw new Error("useStaff must be used within a StaffProvider");
	}
	return context;
};

export default StaffProvider;
