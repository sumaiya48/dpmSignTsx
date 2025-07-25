import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import urlJoin from "url-join";
import { apiStaticURL } from "@/lib/dotenv";
import { blogService } from "@/api";

export interface BlogProps {
	blogId: number;
	title: string;
	content: string;
	bannerImg: string;
	bannerImgUrl: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface BlogContextProps {
	blogs: BlogProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextProps | null>(null);

const BlogProvider = ({ children }: { children: React.ReactNode }) => {
	const [blogs, setBlogs] = useState<BlogProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { logout } = useAuth();
	const location = useLocation();

	// Fetch blogs from the API
	const fetchBlogs = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			const response = await blogService.fetchAllBlog(searchTerm, page, limit);

			const updatedBlogs = response.data.blogs.map((blog: BlogProps) => ({
				...blog,
				bannerImgUrl: urlJoin(apiStaticURL, "/blog-images", blog.bannerImg),
			}));

			setBlogs(updatedBlogs);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch blogs.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch medias only when authToken changes
	useEffect(() => {
		fetchBlogs();
	}, [location, searchTerm, page]); // ✅ Removed `loading` and `location` dependencies

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			blogs,
			searchTerm,
			setSearchTerm,
			page,
			setPage,
			totalPages,
			loading,
			setLoading,
			error,
			fetchBlogs,
		}),
		[blogs, page, searchTerm, loading, error]
	);

	return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
	const context = useContext(BlogContext);
	if (!context) {
		throw new Error("useBlog must be used within a BlogProvider");
	}
	return context;
};

export default BlogProvider;
