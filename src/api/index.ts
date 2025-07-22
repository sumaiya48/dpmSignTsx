import axios, { AxiosError } from "axios";
import { apiBaseURL, apiKey } from "@/lib/dotenv";
import Auth from "@/api/service/auth.service";
import Customer from "@/api/service/customer.service";
import Inquery from "@/api/service/inquery.service";
import Newsletter from "@/api/service/newsletter.service";
import Staff from "@/api/service/staff.service";
import UserProfile from "@/api/service/user-profile.service";
import Faq from "@/api/service/faq.service";
import Category from "@/api/service/category.service";
import Coupon from "@/api/service/coupon.service";
import ProductReview from "@/api/service/product-review.service";
import Product from "@/api/service/product.service";
import Order from "@/api/service/order.service";
import Media from "@/api/service/media.service";
import Blog from "@/api/service/blog.service";
import Courier from "@/api/service/courier.service";
import Job from "@/api/service/job.service";
import Transaction from "@/api/service/transaction.service";
import Dashboard from "@/api/service/dasboard.service";

export const dashboardService = new Dashboard();
export const authService = new Auth();
export const userProfileService = new UserProfile();
export const customerService = new Customer();
export const inqueryService = new Inquery();
export const newsletterService = new Newsletter();
export const categoryService = new Category();
export const productReviewService = new ProductReview();
export const staffService = new Staff();
export const faqService = new Faq();
export const couponService = new Coupon();
export const productService = new Product();
export const orderService = new Order();
export const mediaService = new Media();
export const blogService = new Blog();
export const courierService = new Courier();
export const jobService = new Job();
export const transactionService = new Transaction();

export interface ApiError extends Error {
	error: Error;
	message: string;
	status?: number;
}

export const apiClient = axios.create({
	baseURL: apiBaseURL,
	headers: {
		"X-API-Key": apiKey,
		"Content-Type": "application/json",
	},
});

export const ping = async () => {
	try {
		const response = await apiClient.get("/");
		return response.data;
	} catch (err: any) {
		let pingRequestError: ApiError;

		if (err instanceof AxiosError) {
			pingRequestError = {
				name: err.name || "AxiosError",
				status: err.response?.status || 500,
				message: err.message,
				error: err,
			};
			throw pingRequestError;
		} else {
			pingRequestError = err.response.data || err.response.data.error;
			pingRequestError.status = err.response.data.status;
			pingRequestError.message =
				pingRequestError.message ||
				pingRequestError.error.message ||
				"An unknown error occured.";
			throw pingRequestError;
		}
	}
};
