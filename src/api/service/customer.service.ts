import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class Customer {
	private fetchAllCustomerUrl: string;
	constructor() {
		this.fetchAllCustomerUrl = `${apiBaseURL}/customer`;
	}

	fetchAllCustomer = async (
		authToken: string,
		searchTerm: string,
		searchBy: "name" | "email" | "phone",
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
				params.append("searchBy", searchBy);
			}

			const response = await apiClient.get(
				`${this.fetchAllCustomerUrl}/?${params.toString()}`,
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
}

export default Customer;
