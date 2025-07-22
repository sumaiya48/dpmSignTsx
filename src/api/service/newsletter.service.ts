import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class Newsletter {
	private fetchAllNewsletterUrl: string;
	private deleteByEmailUrl: string;
	constructor() {
		this.fetchAllNewsletterUrl = `${apiBaseURL}/newsletter`;
		this.deleteByEmailUrl = `${apiBaseURL}/newsletter/`;
	}

	fetchAllNewsletter = async (
		authToken: string,
		searchTerm: string,
		page: number,
		limit: number
	) => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (searchTerm.length > 0) {
				params.append("searchTerm", searchTerm);
			}

			const response = await apiClient.get(
				`${this.fetchAllNewsletterUrl}/?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let fetchRequestError: ApiError;

			if (err instanceof AxiosError) {
				fetchRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw fetchRequestError;
			} else {
				fetchRequestError = err.response.data || err.response.data.error;
				fetchRequestError.status = err.response.data.status;
				fetchRequestError.message =
					fetchRequestError.message ||
					fetchRequestError.error.message ||
					"An unknown error occured.";
				throw fetchRequestError;
			}
		}
	};

	deleteByEmail = async (authToken: string, email: string) => {
		try {
			const body = {
				email,
			};
			const response = await apiClient.delete(this.deleteByEmailUrl, {
				data: body,
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let deleteRequestError: ApiError;

			if (err instanceof AxiosError) {
				deleteRequestError = {
					name: err.name || "AxiosError",
					status:
						err.response?.data?.status ||
						err.response?.data?.status ||
						err.status,
					message:
						err.response?.data?.message ||
						err.response?.data?.error ||
						err.message,
					error: err,
				};
				throw deleteRequestError;
			} else {
				deleteRequestError = err.response.data || err.response.data.error;
				deleteRequestError.status = err.response.data.status;
				deleteRequestError.message =
					deleteRequestError.message ||
					deleteRequestError.error.message ||
					"An unknown error occured.";
				throw deleteRequestError;
			}
		}
	};
}

export default Newsletter;
