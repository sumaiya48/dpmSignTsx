import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { couponService } from "@/api";

export interface CouponProps {
	couponId: number;
	name: string;
	code: string;
	discountType: "flat" | "percentage";
	amount: number;
	minimumAmount: number;
	startDate: Date;
	endDate: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CouponContextProps {
	coupons: CouponProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "name" | "code";
	setSearchBy: React.Dispatch<React.SetStateAction<"name" | "code">>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchCoupons: () => Promise<void>;
	checkCoupon: (
		couponId: number,
		totalPrice: number
	) => Promise<CheckCouponResponseProps>;
}

interface CheckCouponResponseProps {
	valid: boolean;
	totalPrice?: number;
	discountedPrice?: number;
	coupon?: CouponProps;
}

const CouponContext = createContext<CouponContextProps | null>(null);

const CouponProvider = ({ children }: { children: React.ReactNode }) => {
	const [coupons, setCoupons] = useState<CouponProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchBy, setSearchBy] = useState<"name" | "code">("name");
	const [page, setPage] = useState<number>(1);
	const limit = 20;
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { authToken, logout } = useAuth();
	const location = useLocation();

	// Fetch coupons from the API
	const fetchCoupons = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);
		try {
			if (!authToken) {
				logout();
				throw new Error("Authentication token is missing.");
			}
			const response = await couponService.fetchAllCoupon(
				authToken,
				searchTerm,
				searchBy,
				page,
				limit
			);

			const updatedCoupons = response.data.coupons.map(
				(coupon: CouponProps) => ({
					...coupon,
					amount: Number(coupon.amount),
				})
			);

			setCoupons(updatedCoupons);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			setError(err.message || "Failed to fetch coupons.");
			if (err.status === 401) {
				return logout();
			}
		} finally {
			setLoading(false);
		}
	};

	const checkCoupon = async (
		couponId: number,
		totalPrice: number
	): Promise<CheckCouponResponseProps> => {
		const couponCode = coupons.find(
			(coupon) => coupon.couponId === couponId
		)?.code;

		if (!couponCode) {
			throw new Error("Coupon not found.");
		}

		const response = await couponService.checkCouponStatus(
			couponCode,
			totalPrice
		);

		return response.data;
	};

	// Fetch coupons on component mount
	useEffect(() => {
		if (authToken) {
			fetchCoupons();
		}
	}, [authToken, location, searchTerm, page]);

	// Memoize the context value to avoid unnecessary re-renders
	const value = useMemo(
		() => ({
			coupons,
			searchTerm,
			setSearchTerm,
			searchBy,
			setSearchBy,
			totalPages,
			page,
			setPage,
			loading,
			setLoading,
			error,
			fetchCoupons,
			checkCoupon,
		}),
		[coupons, loading, error, searchTerm, page]
	);

	return (
		<CouponContext.Provider value={value}>{children}</CouponContext.Provider>
	);
};

export const useCoupons = () => {
	const context = useContext(CouponContext);
	if (!context) {
		throw new Error("useCoupons must be used within a CouponProvider");
	}
	return context;
};

export default CouponProvider;
