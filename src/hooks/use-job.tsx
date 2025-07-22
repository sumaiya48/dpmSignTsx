import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { jobService } from "@/api";

export interface JobProps {
	jobId: number;
	title: string;
	content: string;
	jobLocation: string;
	applicationUrl: string;
	status: "open" | "closed";
	createdAt: Date;
	updatedAt: Date;
}

export interface JobContextProps {
	jobs: JobProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextProps | null>(null);

const JobProvider = ({ children }: { children: React.ReactNode }) => {
	const [jobs, setJobs] = useState<JobProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch jobs from the API
	const fetchJobs = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await jobService.fetchAllJob(
				authToken,
				searchTerm,
				page,
				limit
			);
			setJobs(response.data.jobs);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch jobs.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch jobs on component mount
	useEffect(() => {
		if (authToken) {
			fetchJobs();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			jobs,
			searchTerm,
			setSearchTerm,
			page,
			setPage,
			totalPages,
			loading,
			setLoading,
			error,
			fetchJobs,
		}),
		[jobs, loading, searchTerm, page, error]
	);

	return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
	const context = useContext(JobContext);
	if (!context) {
		throw new Error("useJobs must be used within a JobProvider");
	}
	return context;
};

export default JobProvider;
