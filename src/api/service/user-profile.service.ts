import { apiBaseURL } from "@/lib/dotenv";
import Joi from "joi";
import { apiClient, ApiError } from "@/api";
import { AxiosError } from "axios";

class UserProfile {
	private schema: {
		avatar: Joi.AnySchema;
		name: Joi.StringSchema;
		phone: Joi.StringSchema;
		password: Joi.StringSchema;
	};

	private editProfileUrl: string;
	public editProfileSchema: Joi.ObjectSchema;

	constructor() {
		this.schema = {
			avatar: Joi.any(),
			name: Joi.string().trim().min(2).required().messages({
				"string.base": "Name must be a string.",
				"string.empty": "Name cannot be empty.",
				"string.min": "Name must be at least 2 characters long.",
				"any.required": "Name cannot be empty.",
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

		this.editProfileUrl = `${apiBaseURL}`;

		this.editProfileSchema = Joi.object({
			avatar: this.schema.avatar,
			name: this.schema.name,
			currentPassword: this.schema.password,
			newPassword: Joi.string().trim().min(8).optional().allow("").messages({
				"string.base": "Password must be a string.",
				"string.min": "Password must be at least 8 characters long.",
			}),
			phone: this.schema.phone,
		});
	}

	updateProfile = async (
		authToken: string,
		role: string,
		avatar: File | null,
		keepPreviousAvatar: boolean | null,
		name: string,
		currentPassword: string,
		newPassword: string,
		phone: string
	) => {
		try {
			const form = new FormData();
			// Append text fields to the FormData object
			form.append("name", name);
			form.append("currentPassword", currentPassword);
			form.append("newPassword", newPassword);
			form.append("phone", phone);

			if (avatar instanceof File || avatar) {
				form.append("avatar", avatar, avatar.name);
			} else {
				form.append("avatar", "null");
			}

			if (keepPreviousAvatar) {
				form.append("keepPreviousAvatar", "true");
				form.append("avatar", "null");
			} else {
				form.append("keepPreviousAvatar", "false");
			}

			const response = await apiClient.put(
				`${this.editProfileUrl}/${role === "admin" ? "admin" : "staff"}/`,
				form,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (err: any) {
			let updateProfileError: ApiError;

			if (err instanceof AxiosError) {
				updateProfileError = {
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
				throw updateProfileError;
			} else {
				updateProfileError = err.response.data || err.response.data.error;
				updateProfileError.status = err.response.data.status;
				updateProfileError.message =
					updateProfileError.message ||
					updateProfileError.error.message ||
					"An unknown error occured.";
				throw updateProfileError;
			}
		}
	};
}

export default UserProfile;
