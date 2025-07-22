import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";
import Joi from "joi";

class Job {
	private schema: {
		jobId: Joi.NumberSchema;
		title: Joi.StringSchema;
		content: Joi.StringSchema;
		jobLocation: Joi.StringSchema;
		applicationUrl: Joi.StringSchema;
		status: Joi.StringSchema;
	};
	public jobSchema: Joi.ObjectSchema;
	private jobBaseUrl: string;
	constructor() {
		this.schema = {
			jobId: Joi.number().optional(),
			title: Joi.string().trim().min(5).required().messages({
				"string.base": "Title must be a string.",
				"string.empty": "Title cannot be empty.",
				"string.min": "Title must be at least 5 characters long.",
				"any.required": "Title is required.",
			}),
			content: Joi.string().trim().required().messages({
				"string.base": "Contet must be a string.",
				"string.empty": "Contet cannot be empty.",
				"any.required": "Contet is required.",
			}),
			jobLocation: Joi.string().trim().required().messages({
				"string.base": "Location must be a string.",
				"string.empty": "Location cannot be empty.",
				"any.required": "Location is required.",
			}),
			applicationUrl: Joi.string().trim().required().messages({
				"string.base": "Application URL must be a string.",
				"string.empty": "Application URL cannot be empty.",
				"any.required": "Application URL is required.",
			}),
			status: Joi.string().trim().valid("open", "closed").required().messages({
				"string.base": "status must be a string.",
				"string.empty": "status cannot be empty.",
				"any.required": "status is required.",
				"any.only": "status must be either open or closed.",
			}),
		};
		this.jobSchema = Joi.object({
			jobId: this.schema.jobId,
			title: this.schema.title,
			content: this.schema.content,
			jobLocation: this.schema.jobLocation,
			applicationUrl: this.schema.applicationUrl,
			status: this.schema.status,
		});

		this.jobBaseUrl = `${apiBaseURL}/job`;
	}

	fetchAllJob = async (
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
				`${this.jobBaseUrl}/?${params.toString()}`,
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

	createJob = async (
		authToken: string,
		title: string,
		content: string,
		jobLocation: string,
		applicationUrl: string,
		status: "open" | "closed"
	) => {
		try {
			const body = {
				title,
				content,
				jobLocation,
				applicationUrl,
				status,
			};

			const response = await apiClient.post(this.jobBaseUrl, body, {
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

	updateJob = async (
		authToken: string,
		jobId: number,
		title: string,
		content: string,
		jobLocation: string,
		applicationUrl: string,
		status: "open" | "closed"
	) => {
		try {
			const body = {
				jobId,
				title,
				content,
				jobLocation,
				applicationUrl,
				status,
			};
			const response = await apiClient.put(this.jobBaseUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			throw err;
		}
	};

	deleteByJobId = async (authToken: string, jobId: number) => {
		try {
			const response = await apiClient.delete(`${this.jobBaseUrl}/${jobId}`, {
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

export default Job;
