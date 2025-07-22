import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";
import Joi from "joi";

class Faq {
	private schema: {
		faqTitle: Joi.StringSchema;
		faqItems: Joi.ArraySchema;
	};
	public faqSchema: Joi.ObjectSchema;
	public faqItemsSchema: Joi.ObjectSchema;
	private faqBaseUrl: string;
	private createFaqUrl: string;
	constructor() {
		this.faqItemsSchema = Joi.object({
			question: Joi.string().required().messages({
				"string.base": "question must be a string.",
				"string.empty": "question cannot be empty.",
				"any.required": "question is required.",
			}),
			answer: Joi.string().required().messages({
				"string.base": "answer must be a string.",
				"string.empty": "answer cannot be empty.",
				"any.required": "answer is required.",
			}),
		});

		this.schema = {
			faqTitle: Joi.string().trim().min(5).required().messages({
				"string.base": "Title must be a string.",
				"string.empty": "Title cannot be empty.",
				"string.min": "Title must be at least 5 characters long.",
				"any.required": "Title is required.",
			}),
			faqItems: Joi.array()
				.items(this.faqItemsSchema)
				.required()
				.min(1)
				.messages({
					"array.base": "faq items must be an array.",
					"array.empty": "faq items cannot be empty.",
					"array.min": "At least one faq item is required.",
				}),
		};
		this.faqSchema = Joi.object({
			faqTitle: this.schema.faqTitle,
			faqItems: this.schema.faqItems,
		});

		this.faqBaseUrl = `${apiBaseURL}/faq`;
		this.createFaqUrl = `${apiBaseURL}/faq/create`;
	}

	fetchAllFaq = async (
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
				`${this.faqBaseUrl}/?${params.toString()}`,
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

	createFaq = async (authToken: string, faqTitle: string, faqItems: any[]) => {
		try {
			const body = {
				faqTitle,
				faqItems,
			};

			const response = await apiClient.post(this.createFaqUrl, body, {
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

	updateFaq = async (
		authToken: string,
		faqId: number,
		faqTitle: string,
		faqItems: any[]
	) => {
		try {
			const body = { faqId, faqTitle, faqItems };
			const response = await apiClient.put(this.faqBaseUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			throw err;
		}
	};

	deleteByFaqId = async (authToken: string, faqId: number) => {
		try {
			const body = {
				faqId,
			};
			const response = await apiClient.delete(this.faqBaseUrl, {
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

export default Faq;
