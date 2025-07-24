import urlJoin from "url-join";

export const apiUrl: string = urlJoin(
	import.meta.env.VITE_API_URL || "https://api.dpmsign.com"
);
export const apiKey: string = import.meta.env.VITE_API_KEY || "";
export const apiBaseURL: string = urlJoin(
	import.meta.env.VITE_API_URL || "https://api.dpmsign.com",
	"/api"
);
export const apiStaticURL: string = urlJoin(
	import.meta.env.VITE_API_URL || "https://api.dpmsign.com",
	"/static"
);
export const frontendLandingPageURL: string =
	import.meta.env.VITE_FRONTEND_LANDING_PAGE_URL || "https://dpmsign.com";
