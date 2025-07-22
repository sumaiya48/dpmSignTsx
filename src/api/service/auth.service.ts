import { apiBaseURL } from "@/lib/dotenv";
import Joi from "joi";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class Auth {
	private schema: {
		name: Joi.StringSchema;
		email: Joi.StringSchema;
		phone: Joi.StringSchema;
		password: Joi.StringSchema;
	};
	private canRegisterAdminUrl: string;
	private adminRegistrationUrl: string;
	private loginUrl: string;
	public adminRegistrationSchema: Joi.ObjectSchema;
	public loginSchema: Joi.ObjectSchema;

	constructor() {
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
		};

		this.adminRegistrationSchema = Joi.object({
			name: this.schema.name,
			email: this.schema.email,
			phone: this.schema.phone,
			password: this.schema.password,
		});

		this.loginSchema = Joi.object({
			email: this.schema.email,
			password: this.schema.password,
		});

		this.canRegisterAdminUrl = `${apiBaseURL}/auth/`;
		this.adminRegistrationUrl = `${apiBaseURL}/auth/register`;
		this.loginUrl = `${apiBaseURL}/auth/login`;
	}

	canRegisterAdmin = async () => {
		try {
			const response = await apiClient.get(this.canRegisterAdminUrl);
			return response.data;
		} catch (err: any) {
			let canRegisterRequestError: ApiError;

			if (err instanceof AxiosError) {
				canRegisterRequestError = {
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
				throw canRegisterRequestError;
			} else {
				canRegisterRequestError = err.response.data || err.response.data.error;
				canRegisterRequestError.status = err.response.data.status;
				canRegisterRequestError.message =
					canRegisterRequestError.message ||
					canRegisterRequestError.error.message ||
					"An unknown error occured.";
				throw canRegisterRequestError;
			}
		}
	};

	registerAdmin = async (
		name: string,
		email: string,
		phone: string,
		password: string
	) => {
		try {
			const body = {
				name,
				email,
				phone,
				password,
			};
			const response = await apiClient.post(this.adminRegistrationUrl, body);
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

	login = async (email: string, password: string) => {
		try {
			const body = {
				email,
				password,
			};
			const response = await apiClient.post(this.loginUrl, body);

			return response.data;
		} catch (err: any) {
			let loginRequestError: ApiError;

			if (err instanceof AxiosError) {
				loginRequestError = {
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
				throw loginRequestError;
			} else {
				loginRequestError = err.response.data || err.response.data.error;
				loginRequestError.status = err.response.data.status;
				loginRequestError.message =
					loginRequestError.message ||
					loginRequestError.error.message ||
					"An unknown error occured.";
				throw loginRequestError;
			}
		}
	};
}

export default Auth;
