import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class Inquery {
	private fetchAllInqueryUrl: string;
	private closeInqueryUrl: string;
	private openInqueryUrl: string;
	private deleteInqueryUrl: string;
	constructor() {
		this.fetchAllInqueryUrl = `${apiBaseURL}/inquery`;
		this.closeInqueryUrl = `${apiBaseURL}/inquery/close`;
		this.openInqueryUrl = `${apiBaseURL}/inquery/open`;
		this.deleteInqueryUrl = `${apiBaseURL}/inquery/`;
	}

	fetchAllInquery = async (
		authToken: string,
		searchTerm: string,
		searchBy: "name" | "email" | "phone",
		inqueryType:
			| "all"
			| "product-information"
			| "pricing"
			| "customization-options"
			| "others",
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

			if (inqueryType !== "all") {
				params.append("inqueryType", inqueryType);
			}

			const response = await apiClient.get(
				`${this.fetchAllInqueryUrl}/?${params.toString()}`,
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

	closeInquery = async (authToken: string, inqueryId: number) => {
		try {
			const response = await apiClient.get(
				`${this.closeInqueryUrl}/?inqueryId=${inqueryId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let closeRequestError: ApiError;

			if (err instanceof AxiosError) {
				closeRequestError = {
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
				throw closeRequestError;
			} else {
				closeRequestError = err.response.data || err.response.data.error;
				closeRequestError.status = err.response.data.status;
				closeRequestError.message =
					closeRequestError.message ||
					closeRequestError.error.message ||
					"An unknown error occured.";
				throw closeRequestError;
			}
		}
	};

	openInquery = async (authToken: string, inqueryId: number) => {
		try {
			const response = await apiClient.get(
				`${this.openInqueryUrl}/?inqueryId=${inqueryId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let openRequestError: ApiError;

			if (err instanceof AxiosError) {
				openRequestError = {
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
				throw openRequestError;
			} else {
				openRequestError = err.response.data || err.response.data.error;
				openRequestError.status = err.response.data.status;
				openRequestError.message =
					openRequestError.message ||
					openRequestError.error.message ||
					"An unknown error occured.";
				throw openRequestError;
			}
		}
	};

	deleteInquery = async (authToken: string, inqueryId: number) => {
		try {
			const body = {
				inqueryId,
			};
			const response = await apiClient.delete(this.deleteInqueryUrl, {
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

export default Inquery;
