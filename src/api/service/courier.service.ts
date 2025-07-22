import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import Joi from "joi";
import { AxiosError } from "axios";

class Courier {
	private schema: {
		courierId: Joi.NumberSchema;
		name: Joi.StringSchema;
	};
	private courierBaseUrl: string;
	private addCourierUrl: string;
	public courierAddSchema: Joi.ObjectSchema;
	public courierEditSchema: Joi.ObjectSchema;
	constructor() {
		this.schema = {
			courierId: Joi.number().required().messages({
				"number.base": "courierId must be a number.",
				"number.empty": "courierId cannot be empty.",
				"number.required": "courierId is required.",
			}),
			name: Joi.string().trim().required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"any.required": "Name is required.",
			}),
		};

		this.courierBaseUrl = `${apiBaseURL}/courier`;
		this.addCourierUrl = `${apiBaseURL}/courier/add`;

		this.courierAddSchema = Joi.object({
			name: this.schema.name,
		});
		this.courierEditSchema = Joi.object(this.schema);
	}

	fetchAllCourier = async (
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
				`${this.courierBaseUrl}/?${params.toString()}`,
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

	addCourier = async (authToken: string, name: string) => {
		try {
			const body = {
				name,
			};

			const response = await apiClient.post(this.addCourierUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
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
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};

	editCourier = async (authToken: string, courierId: number, name: string) => {
		try {
			const body = {
				courierId,
				name,
			};

			const response = await apiClient.put(`${this.courierBaseUrl}/`, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
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
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};

	deleteCourier = async (authToken: string, courierId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.courierBaseUrl}/${courierId}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let createRequestError: ApiError;

			if (err instanceof AxiosError) {
				createRequestError = {
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
				throw createRequestError;
			} else {
				createRequestError = err.response.data || err.response.data.error;
				createRequestError.status = err.response.data.status;
				createRequestError.message =
					createRequestError.message ||
					createRequestError.error.message ||
					"An unknown error occured.";
				throw createRequestError;
			}
		}
	};
}

export default Courier;
