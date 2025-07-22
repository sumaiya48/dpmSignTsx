import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class Dashboard {
	private dashboardBaseUrl: string;
	constructor() {
		this.dashboardBaseUrl = `${apiBaseURL}/dashboard`;
	}

	fetchDashboardStats = async (authToken: string) => {
		try {
			const response = await apiClient.get(this.dashboardBaseUrl, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
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
}

export default Dashboard;
