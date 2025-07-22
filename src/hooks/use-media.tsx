import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { mediaService } from "@/api";
import urlJoin from "url-join";
import { apiStaticURL } from "@/lib/dotenv";

export interface MediaProps {
	imageId: number;
	imageName: string;
	imageUrl: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface MediaContextProps {
	medias: MediaProps[];
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchMedias: () => Promise<void>;
}

const MediaContext = createContext<MediaContextProps | null>(null);

const MediaProvider = ({ children }: { children: React.ReactNode }) => {
	const [medias, setMedias] = useState<MediaProps[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch medias from the API
	const fetchMedias = async () => {
		if (loading) return; // ✅ Prevents multiple API calls if already loading
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}

			const response = await mediaService.fetchAllMedia(authToken);

			const updatedMedias = response.data.medias.map(
				(mediaItem: MediaProps) => ({
					...mediaItem,
					imageUrl: urlJoin(apiStaticURL, "/media-images", mediaItem.imageName),
				})
			);

			setMedias(updatedMedias);
		} catch (err: any) {
			setError(err.message || "Failed to fetch medias.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	// Fetch medias only when authToken changes
	useEffect(() => {
		if (authToken) {
			fetchMedias();
		}
	}, [authToken, location]); // ✅ Removed `loading` and `location` dependencies

	// Memoize the context value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({ medias, loading, setLoading, error, fetchMedias }),
		[medias, loading, error]
	);

	return (
		<MediaContext.Provider value={value}>{children}</MediaContext.Provider>
	);
};

export const useMedia = () => {
	const context = useContext(MediaContext);
	if (!context) {
		throw new Error("useMedia must be used within a MediaProvider");
	}
	return context;
};

export default MediaProvider;
