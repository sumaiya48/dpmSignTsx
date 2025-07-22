import urlJoin from "url-join";

export const apiUrl: string = urlJoin(import.meta.env.VITE_API_URL);
export const apiKey: string = import.meta.env.VITE_API_KEY;
export const apiBaseURL: string = urlJoin(import.meta.env.VITE_API_URL, "/api");
export const apiStaticURL = urlJoin(import.meta.env.VITE_API_URL, "/static");
export const frontendLandingPageURL = import.meta.env
	.VITE_FRONTEND_LANDING_PAGE_URL;
