import { apiBaseURL } from "@/lib/dotenv";
import { apiClient, ApiError } from "@/api";
import Joi from "joi";
import { AxiosError } from "axios";

class Staff {
	private fetchAllStaffUrl: string;
	private registerStaffUrl: string;
	private updateStaffUrl: string;
	private deleteStaffUrl: string;
	private clearBalanceUrl: string;
	private schema: {
		name: Joi.StringSchema;
		email: Joi.StringSchema;
		phone: Joi.StringSchema;
		password: Joi.StringSchema;
		role: Joi.StringSchema;
		commissionPercentage: Joi.NumberSchema;
		designCharge: Joi.NumberSchema;
	};
	public staffRegistrationSchema: Joi.ObjectSchema;
	public staffUpdateSchema: Joi.ObjectSchema;
	constructor() {
		this.fetchAllStaffUrl = `${apiBaseURL}/staff`;
		this.registerStaffUrl = `${apiBaseURL}/staff/register`;
		this.updateStaffUrl = `${apiBaseURL}/staff/update`;
		this.deleteStaffUrl = `${apiBaseURL}/staff`;
		this.clearBalanceUrl = `${apiBaseURL}/staff/clear-balance`;
		this.schema = {
			name: Joi.string().trim().min(2).required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"string.min": "Name must be at least 2 characters long.",
				"any.required": "Name cannot be empty.",
			}),
			email: Joi.string()
				.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
				.message("Invalid email address.")
				.required()
				.messages({
					"string.base": "Email must be a string.",
					"string.empty": "Email cannot be empty.",
					"any.required": "Email cannot be empty.",
				}),
			phone: Joi.string()
				.trim()
				.required()
				.pattern(/^01[3-9][0-9]{8}$/)
				.messages({
					"string.pattern.base":
						"Phone number must be a valid Bangladeshi number starting with 01 and 11 digits long.",
					"string.empty": "Phone number cannot be empty.",
				}),
			password: Joi.string().trim().min(8).required().messages({
				"string.base": "Password must be a string.",
				"string.empty": "Password cannot be empty.",
				"string.min": "Password must be at least 8 characters long.",
				"any.required": "Password cannot be empty.",
			}),
			role: Joi.string().trim().optional().valid("agent", "designer").messages({
				"string.base": "role must be a string.",
				"string.empty": "role is required.",
				"string.valid": "Invalid role. role must be 'agent' or 'designer'.",
			}),
			commissionPercentage: Joi.number().optional().default(1).messages({
				"number.base": "Commission percentage must be a number.",
				"number.empty": "Commission percentage cannot be empty.",
			}),
			designCharge: Joi.number().allow(null).optional().messages({
				"number.base": "Design charge must be a number.",
				"number.empty": "Design charge cannot be empty.",
			}),
		};

		this.staffRegistrationSchema = Joi.object({
			name: this.schema.name,
			email: this.schema.email,
			phone: this.schema.phone,
			password: this.schema.password,
			role: this.schema.role,
			commissionPercentage: this.schema.commissionPercentage,
			designCharge: this.schema.designCharge,
		});

		this.staffUpdateSchema = Joi.object({
			name: this.schema.name,
			email: this.schema.email,
			phone: this.schema.phone,
			role: this.schema.role,
			commissionPercentage: this.schema.commissionPercentage,
			designCharge: this.schema.designCharge,
		});
	}

	clearBalance = async (authToken: string, staffId: number) => {
		try {
			const response = await apiClient.get(
				`${this.clearBalanceUrl}/${staffId}`,
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

	deleteStaff = async (authToken: string, staffId: number) => {
		try {
			const response = await apiClient.delete(
				`${this.deleteStaffUrl}/${staffId}`,
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

	fetchAllStaff = async (
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
				`${this.fetchAllStaffUrl}?${params.toString()}`,
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

	registerStaff = async (
		authToken: string,
		name: string,
		email: string,
		phone: string,
		password: string,
		role: string,
		commissionPercentage: number,
		designCharge?: number
	) => {
		try {
			const body = {
				name,
				email,
				phone,
				password,
				role,
				commissionPercentage,
				designCharge,
			};
			const response = await apiClient.post(this.registerStaffUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let registerRequestError: ApiError;

			if (err instanceof AxiosError) {
				registerRequestError = {
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
				throw registerRequestError;
			} else {
				registerRequestError = err.response.data || err.response.data.error;
				registerRequestError.status = err.response.data.status;
				registerRequestError.message =
					registerRequestError.message ||
					registerRequestError.error.message ||
					"An unknown error occured.";
				throw registerRequestError;
			}
		}
	};

	updateStaff = async (
		authToken: string,
		name: string,
		email: string,
		phone: string,
		role: string,
		commissionPercentage: number,
		designCharge?: number
	) => {
		try {
			const body = {
				name,
				email,
				phone,
				role,
				commissionPercentage,
				designCharge,
			};
			const response = await apiClient.put(this.updateStaffUrl, body, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
			return response.data;
		} catch (err: any) {
			let registerRequestError: ApiError;

			if (err instanceof AxiosError) {
				registerRequestError = {
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
				throw registerRequestError;
			} else {
				registerRequestError = err.response.data || err.response.data.error;
				registerRequestError.status = err.response.data.status;
				registerRequestError.message =
					registerRequestError.message ||
					registerRequestError.error.message ||
					"An unknown error occured.";
				throw registerRequestError;
			}
		}
	};
}

export default Staff;
