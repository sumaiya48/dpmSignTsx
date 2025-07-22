import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import Joi from "joi";
import { AxiosError } from "axios";

class Category {
	private schema: {
		name: Joi.StringSchema;
		parentCategoryId: Joi.NumberSchema;
	};
	private categoryBaseUrl: string;
	private createCategoryUrl: string;
	public categoryCreationSchema: Joi.ObjectSchema;
	public categoryEditSchema: Joi.ObjectSchema;
	constructor() {
		this.schema = {
			name: Joi.string().trim().required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"any.required": "Name is required.",
			}),
			parentCategoryId: Joi.number().optional().messages({
				"number.base": "Please select a parent category.",
			}),
		};

		this.categoryBaseUrl = `${apiBaseURL}/product-category`;
		this.createCategoryUrl = `${apiBaseURL}/product-category/create`;

		this.categoryCreationSchema = Joi.object({
			name: this.schema.name,
			parentCategoryId: this.schema.parentCategoryId,
		});
		this.categoryEditSchema = Joi.object({
			name: this.schema.name,
			parentCategoryId: this.schema.parentCategoryId,
		});
	}

	fetchCategoryById = async (authToken: string, categoryId: number) => {
		try {
			const response = await apiClient.get(
				`${this.categoryBaseUrl}/${categoryId}`,
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

	fetchAllCategory = async (
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
				`${this.categoryBaseUrl}/?${params.toString()}`,
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

	createCategory = async (
		authToken: string,
		name: string,
		parentCategoryId: number
	) => {
		try {
			const body = {
				name,
			};
			if (parentCategoryId > 0)
				(body as any).parentCategoryId = parentCategoryId;

			const response = await apiClient.post(this.createCategoryUrl, body, {
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

	editCategory = async (
		authToken: string,
		categoryId: number,
		name: string,
		parentCategoryId: number
	) => {
		try {
			const body = {
				categoryId,
				name,
			};
			if (parentCategoryId > 0)
				(body as any).parentCategoryId = parentCategoryId;

			const response = await apiClient.put(`${this.categoryBaseUrl}/`, body, {
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

	deleteCategory = async (authToken: string, categoryId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.categoryBaseUrl}/${categoryId}`,
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

export default Category;
