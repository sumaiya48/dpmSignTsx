import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	useCallback,
} from "react";
import { StaffProps, useAuth } from "@/hooks/use-auth";
import { useLocation } from "react-router-dom";
import { orderService } from "@/api";
import { socket } from "@/lib/socket";
import urljoin from "url-join";
import { apiStaticURL } from "@/lib/dotenv";

export interface OrderProps {
	orderId: number;
	customerId: number | null;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	staffId: number;
	billingAddress: string;
	additionalNotes: string;
	method: "online" | "offline";
	status:
		| "order-request-received"
		| "consultation-in-progress"
		| "order-canceled"
		| "awaiting-advance-payment"
		| "advance-payment-received"
		| "design-in-progress"
		| "awaiting-design-approval"
		| "production-started"
		| "production-in-progress"
		| "ready-for-delivery"
		| "out-for-delivery"
		| "order-completed";
	currentStatus: string;
	deliveryDate: Date | null;
	deliveryMethod: "shop-pickup" | "courier";
	paymentMethod: "online-payment" | "cod-payment";
	paymentStatus: "pending" | "partial" | "paid";
	orderTotalPrice: number;
	couponId: number | null;
	courierId: number | null;
	courierAddress: string | null;
	orderItems: OrderItemProps[];
	payments: PaymentProps[];
	images: OrderImageProps[];
	createdAt: Date;
	deletedAt: Date;
}

export interface OrderImageProps {
	imageId: number;
	imageName: string;
	imageUrl: string;
	orderId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderItemProps {
	productVariantId?: number | null;
	product?: {
		productId: number;
		name: string;
		basePrice: number;
		sku: string;
	};
	unlistedProduct?: {
		unlistedProductId: number;
		name: string;
		description: string;
		basePrice: number;
		pricingType: "flat" | "square-feet";
		createdAt: Date;
		updatedAt: Date;
	};
	productVariant?: {
		productVariantId: number;
		productId: number;
		additionalPrice: number;
		variantDetails: {
			productVariantDetailId: number;
			productVariantId: number;
			variationItemId: number;
			variationItem: {
				value: string;
				// variation: {
				// 	name: string;
				// 	unit: string;
				// };
			};
		}[];
	};
	orderItemId: number;
	orderId: number;
	productId?: number | null;
	unlistedProductId?: number | null;
	quantity: number;
	price: number;
	size: number | null;
	widthInch: number | null;
	heightInch: number | null;
	createdAt: Date;
	deletedAt: Date;
}

export interface PaymentProps {
	paymentId: number;
	transactionId: string;
	orderId: number;
	paymentMethod: "cod-payment" | "online-payment";
	amount: number;
	paymentLink: string | null;
	isPaid: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderContextProps {
	orders: OrderProps[];
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	searchBy: "order-id" | "customer-name" | "customer-phone" | "customer-email";
	setSearchBy: React.Dispatch<
		React.SetStateAction<
			"order-id" | "customer-name" | "customer-phone" | "customer-email"
		>
	>;
	filteredBy: "all" | "active" | "requested" | "completed" | "cancelled";
	setFilteredBy: React.Dispatch<
		React.SetStateAction<
			"all" | "active" | "requested" | "completed" | "cancelled"
		>
	>;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	limit: number;
	setLimit: React.Dispatch<React.SetStateAction<number>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	error: string | null;
	fetchOrder: () => Promise<void>;
}

const OrderContext = createContext<OrderContextProps | null>(null);

const OrderProvider = ({
	children,
	initialFilteredBy = "all",
}: {
	children: React.ReactNode;
	initialFilteredBy?:
		| "all"
		| "active"
		| "requested"
		| "completed"
		| "cancelled";
}) => {
	const [orders, setOrders] = useState<OrderProps[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchBy, setSearchBy] = useState<
		"order-id" | "customer-name" | "customer-phone" | "customer-email"
	>("order-id");
	const [filteredBy, setFilteredBy] = useState<
		"all" | "active" | "requested" | "completed" | "cancelled"
	>(initialFilteredBy);

	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(20);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const { user, authToken, logout } = useAuth();
	const location = useLocation();

	// Use useCallback to keep this function stable & prevent extra fetches
	const fetchOrder = useCallback(async () => {
		if (!authToken) {
			logout();
			setError("Authentication token is missing.");
			return;
		}
		// Documentation: Log the user object to verify the role and other details
		// when fetching orders. This helps confirm if the correct role is being sent to the backend.
		console.log("Fetching orders for user:", user);

		setLoading(true);
		setError(null);
		try {
			// Documentation: Modified the API call to include the current user's role.
			// This allows the backend to adjust its filtering logic for different roles.
			// For example, the backend can be configured to return all orders for 'designer' roles,
			// while still filtering by staffId for 'agent' roles.
			const response = await orderService.fetchAllOrders(
				authToken,
				searchTerm,
				searchBy,
				filteredBy,
				page,
				limit,
				null // Temporarily removed role parameter - backend is rejecting it for all users
			);

			const updatedOrders = response.data.orders.map((item: OrderProps) => ({
				...item,
				images:
					item.images?.map((image) => ({
						...image,
						imageUrl: urljoin(apiStaticURL, "/order-images", image.imageName),
					})) || [],
			}));

			setOrders(updatedOrders);
			setTotalPages(response.data.totalPages);
		} catch (err: any) {
			console.log(err.message);
			setError(err.message || "Failed to fetch orders.");
			if (err.status === 401) logout();
		} finally {
			setLoading(false);
		}
	}, [authToken, logout, searchTerm, filteredBy, page, limit, user?.role]); // Added user?.role to dependency array

	socket.on("create-order-request", () => {
		fetchOrder();
	});

	socket.on("create-order", ({ order }: { order: OrderProps }) => {
		if (
			["staff", "agent"].includes(user?.role as any) &&
			order.staffId === (user as StaffProps)?.staffId
		) {
			fetchOrder();
		}
	});

	// Only re-run when token, location, or the fetchOrder function changes.
	useEffect(() => {
		if (authToken) {
			fetchOrder(); // wait for orders to actually come
		}
	}, [authToken, location, searchTerm, filteredBy, page, limit, fetchOrder]); // Added fetchOrder to dependency array

	// Memoize the context value to avoid unnecessary re-renders.
	const value = useMemo(
		() => ({
			orders,
			searchTerm,
			setSearchTerm,
			searchBy,
			setSearchBy,
			filteredBy,
			setFilteredBy,
			page,
			setPage,
			limit,
			setLimit,
			totalPages,
			setTotalPages,
			loading,
			setLoading,
			error,
			fetchOrder,
		}),
		[orders, loading, error, searchTerm, filteredBy, page, limit, fetchOrder] // Added fetchOrder to dependency array
	);

	return (
		<OrderContext.Provider value={value}>{children}</OrderContext.Provider>
	);
};

export const useOrders = () => {
	const context = useContext(OrderContext);
	if (!context) {
		throw new Error("useOrder must be used within an OrderProvider");
	}
	return context;
};

export default OrderProvider;
