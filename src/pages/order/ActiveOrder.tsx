// Documentation: This component displays a list of active orders, allowing users to search, filter, export, and manage visible table columns. It also includes functionality to view and update order details, and delete orders (for admin users).
// import { orderService } from "@/api";
import Header from "@/components/header";
// import {
// 	AlertDialog,
// 	AlertDialogCancel,
// 	AlertDialogContent,
// 	AlertDialogDescription,
// 	AlertDialogFooter,
// 	AlertDialogHeader,
// 	AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { AppPagination } from "@/components/ui/app-pagination";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
// 	Carousel,
// 	CarouselContent,
// 	CarouselItem,
// } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	// DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuGroup,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
// import {
// 	Popover,
// 	PopoverContent,
// 	PopoverTrigger,
// } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import {
// 	Sheet,
// 	SheetContent,
// 	SheetDescription,
// 	SheetHeader,
// 	SheetTitle,
// } from "@/components/ui/sheet";
// import {
// 	Table,
// 	TableBody,
// 	TableCaption,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// // } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { currencyCode } from "@/config";
// import { useAuth } from "@/hooks/use-auth";
import { useCoupons } from "@/hooks/use-coupon";
// import { useCouriers } from "@/hooks/use-courier";
// import { useFormValidation } from "@/hooks/use-form-validation";
import {
	// OrderImageProps,
	// OrderItemProps,
	// OrderProps, // Ensure OrderProps is imported
	useOrders,
} from "@/hooks/use-order";
import { useStaff } from "@/hooks/use-staff";
import { useToast } from "@/hooks/use-toast";
import {  createCSV, createExcelSheet } from "@/lib/utils";
// import { LoadingOverlay } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
// import { differenceInHours, isValid } from "date-fns";
import {
	// CalendarIcon,
	// Clipboard,
	// Clock,
	// ExternalLink,
	// Eye,
	FileSpreadsheet,
	FileText,
	// Mail,
	// MapPin,
	// MoreHorizontal,
	// Package,
	// Pen,
	// Phone,
	Search,
	Settings,
	// Trash,
	// User,
} from "lucide-react";
import {  useEffect, useState, useMemo } from "react"; // Import useMemo
// import { Link } from "react-router-dom";
import OrderTable from "./OrderTable";
// import OrderViewDialog from "./dialogs/OrderViewDialog";
// import OrderDeleteDialog from "./dialogs/OrderDeleteDialog";
// import EditableField from "@/components/ui/EditableField";

const ActiveOrder = () => {
	const [showColumnManager, setShowColumnManager] = useState(false);
	const [tempVisibleColumns, setTempVisibleColumns] = useState<string[]>([]);

	// Documentation: Define default visible columns.
	const defaultVisibleColumns = [
		"orderDate",
		"orderId",
		"customerName",
		"phone",
		"email",
		"orderDetails",
		"totalAmount",
		"advancePayment",
		"due",
		"paymentMethod",
		"paymentStatus",
		"deliveryMethod",
		"billingAddress",
		"courier",
		"deliveryDate",
		"status",
		"method",
		"agent",
		"commission", // Make sure 'commission' is here
		"action",
	];

	// Documentation: Initialize visibleColumns state by attempting to load from localStorage.
	const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
		try {
			const savedColumns = localStorage.getItem("activeOrderVisibleColumns");
			return savedColumns ? JSON.parse(savedColumns) : defaultVisibleColumns;
		} catch (error) {
			console.error("Failed to parse visible columns from localStorage", error);
			return defaultVisibleColumns;
		}
	});

	const allColumns = [
		{ key: "orderDate", label: "Order Date" },
		{ key: "orderId", label: "Order ID" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "phone", label: "Phone" },
		{ key: "email", label: "Email" },
		{ key: "orderDetails", label: "Order Details" },
		{ key: "totalAmount", label: "Total Amount" },
		{ key: "advancePayment", label: "Advance Payment" },
		{ key: "due", label: "Due" },
		{ key: "paymentMethod", label: "Payment Method" },
		{ key: "paymentStatus", label: "Payment Status" },
		{ key: "deliveryMethod", label: "Delivery Method" },
		{ key: "billingAddress", label: "Billing Address" },
		{ key: "courier", label: "Courier" },
		{ key: "deliveryDate", label: "Exp. Delivery Date" },
		{ key: "status", label: "Order Status" },
		{ key: "method", label: "Order Mode" },
		{ key: "agent", label: "Agent" },
		{ key: "commission", label: "Commission" }, // FIX: Changed from "commissionPercentage" to "commission"
		{ key: "action", label: "Action" },
	];

	const {
		orders, // Original orders from useOrders
		setSearchTerm,
		searchBy,
		setSearchBy,
		setFilteredBy,
		setLimit,
		error,
	} = useOrders();
	const [searchValue, setSearchValue] = useState<string>("");
	const { staff } = useStaff(); // Get staff data from useStaff
	const { toast } = useToast();
	const { checkCoupon } = useCoupons(); // Assuming this is needed for totalAmount calculation

	useEffect(() => {
		setFilteredBy("active");
	}, [setFilteredBy]);

	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, [error, toast]);

	useEffect(() => {
		try {
			localStorage.setItem(
				"activeOrderVisibleColumns",
				JSON.stringify(visibleColumns)
			);
		} catch (error) {
			console.error("Failed to save visible columns to localStorage", error);
		}
	}, [visibleColumns]);

	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchValue);
		}, 500);

		return () => clearTimeout(handler);
	}, [searchValue, setSearchTerm]);

    // State to hold coupon-checked prices, used for calculating commission
    const [orderTotalCouponCheckedPrices, setOrderTotalCouponCheckedPrices] =
        useState<Record<number, number>>({});

    const getCouponCheckedPrice = async (
        couponId: number,
        orderTotalPrice: number
    ): Promise<number> => {
        try {
            const result = await checkCoupon(couponId, orderTotalPrice);
            return result.discountedPrice ?? orderTotalPrice; // If no discount, fallback
        } catch (err: any) {
            console.error(err.message);
            return orderTotalPrice; // Fallback to original price on error
        }
    };

    // Effect to calculate coupon-checked prices for recent orders
    useEffect(() => {
        if (orders && orders.length > 0) {
            const newPrices: Record<number, number> = {};
            const fetchPromises = orders.map(async (order) => {
                if (order.couponId) {
                    const couponAppliedPrice = await getCouponCheckedPrice(
                        order.couponId,
                        order.orderTotalPrice
                    );
                    newPrices[order.orderId] = couponAppliedPrice;
                } else {
                    newPrices[order.orderId] = order.orderTotalPrice;
                }
            });

            Promise.all(fetchPromises).then(() => {
                setOrderTotalCouponCheckedPrices(newPrices);
            });
        } else if (orders && orders.length === 0) {
            setOrderTotalCouponCheckedPrices({});
        }
    }, [orders, checkCoupon]);


	// NEW: Memoize orders with calculated commission and coupon-checked total price
	const ordersWithCalculatedData = useMemo(() => {
		if (!orders || !staff) return []; // Ensure orders and staff data are available

		return orders.map((order) => {
			const agent = staff.find((s) => s.staffId === order.staffId);
            const totalAmountAfterCoupon = orderTotalCouponCheckedPrices[order.orderId] ?? order.orderTotalPrice;

			const commissionAmount = agent
				? (totalAmountAfterCoupon * agent.commissionPercentage) / 100
				: 0; // Calculate commission

			return {
				...order,
				commissionAmount: commissionAmount, // Add the calculated commission
				agentCommissionPercentage: agent?.commissionPercentage, // Optionally add percentage for display
                orderTotalPrice: totalAmountAfterCoupon // Override orderTotalPrice with the coupon-checked one for consistency
			};
		});
	}, [orders, staff, orderTotalCouponCheckedPrices]); // Re-calculate when orders, staff, or coupon prices change

	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = ordersWithCalculatedData.map((order) => ({ // Use ordersWithCalculatedData
			ID: order.orderId,
			"Customer Name": order.customerName,
			"Customer Email": order.customerEmail,
			"Customer Phone": order.customerPhone,
			"Order Items": order.orderItems
				.map(
					(item) =>
						`${item?.product?.name || item?.unlistedProduct?.name} (x${
							item.quantity
						} piece), ${item.size ? "(" + item.size + " sq. feet)" : ""}`
				)
				.join(", "),
			"Total Amount": order.orderTotalPrice, // This will now be the coupon-checked amount
			"Payment Method": order.paymentMethod,
			"Payment Status": order.paymentStatus,
			"Delivery Method": order.deliveryMethod,
			"Est. Delivery": order.deliveryDate,
			"Current Status": order.currentStatus,
			Source: order.method,
			"Agent Name":
				staff.filter((staffItem) => staffItem.staffId === order.staffId)[0]
					?.name ?? "N/A",
			"Agent Number":
				staff.filter((staffItem) => staffItem.staffId === order.staffId)[0]
					?.phone ?? "N/A",
			"Commission Amount": order.commissionAmount, // Add commission to export
			"Commission Percentage": order.agentCommissionPercentage, // Add percentage to export
			"Date Added": new Date(order.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "active-orders");
		} else if (format === "csv") {
			createCSV(worksheetData, "active-orders");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Header */}
			<Header
				title="Active Orders"
				description="All the active orders of your store in one place!"
			>
				<div className="truncate flex items-start space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by ${searchBy.split("-").join(" ")}...`}
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				{/* by default set the searchBy as selected */}
				<Select onValueChange={(e) => setSearchBy(e as any)}>
					<SelectTrigger className="w-[160px]" defaultValue={searchBy}>
						<SelectValue placeholder="Search By" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="order-id">Order Id</SelectItem>
							<SelectItem value="customer-name">Customer Name</SelectItem>
							<SelectItem value="customer-phone">Customer Phone</SelectItem>
							<SelectItem value="customer-email">Customer Email</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Header>

			{/* filter options */}
			{orders.length > 0 && ( // Use original orders.length for initial check
				<div className="w-full flex items-center justify-between  gap-4">
					<div className="flex items-center justify-between gap-3">
						<Button variant="success" onClick={() => handleExport("excel")}>
							<FileSpreadsheet size={15} />
							Export Excel
						</Button>
						<Button variant="secondary" onClick={() => handleExport("csv")}>
							<FileText size={15} />
							Export CSV
						</Button>
						<Select
							onValueChange={(e) => {
								setLimit(Number(e) as number);
							}}
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Show items" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="90">90</SelectItem>
									<SelectItem value="120">120</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							onClick={() => {
								setTempVisibleColumns(visibleColumns); // modal খোলার সময় copy রাখবে
								setShowColumnManager(true);
							}}
						>
							<Settings className="mr-2 h-4 w-4" /> Manage Columns
						</Button>
					</div>
				</div>
			)}

			{/* orders tabs */}
			{orders.length > 0 ? ( // Use original orders.length for initial check
				<div className="w-full border border-neutral-200 rounded-lg">
					{/* Pass the enriched ordersWithCalculatedData to OrderTable */}
					<OrderTable orders={ordersWithCalculatedData} visibleColumns={visibleColumns} />
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No order found</p>
				</div>
			)}
			<Dialog open={showColumnManager} onOpenChange={setShowColumnManager}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Manage Table Columns</DialogTitle>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
						{allColumns.map((col) => (
							<label key={col.key} className="flex items-center gap-2">
								<Checkbox
									checked={tempVisibleColumns.includes(col.key)}
									onCheckedChange={(checked) => {
										if (checked) {
											setTempVisibleColumns([...tempVisibleColumns, col.key]);
										} else {
											setTempVisibleColumns(
												tempVisibleColumns.filter((c) => c !== col.key)
											);
										}
									}}
								/>
								<span>{col.label}</span>
							</label>
						))}
					</div>
					<div className="flex justify-end gap-3 mt-4">
						<Button
							variant="outline"
							onClick={() => {
								setShowColumnManager(false); // modal বন্ধ হবে
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setVisibleColumns(tempVisibleColumns); // apply করলে মূল state আপডেট হবে
								setShowColumnManager(false);
							}}
						>
							Apply
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
};

// Documentation: OrderImageSlider component displays a carousel of order-related images.
// const OrderImageSlider = ({ images }: { images: OrderImageProps[] }) => {
// 	if (!images.length) return null;

// 	return (
// 		<div className="w-full">
// 			<h3 className="text-lg font-semibold mb-4">Order Images</h3>
// 			<Carousel className="w-full">
// 				<CarouselContent>
// 					{images.map((image, index) => (
// 						<CarouselItem key={index} className="md:basis-1/4">
// 							<div className="p-1">
// 								<div className="rounded-lg overflow-hidden aspect-square">
// 									<img
// 										src={image.imageUrl}
// 										alt={`Order item ${index + 1}`}
// 										className="w-full h-full object-cover"
// 									/>
// 								</div>
// 							</div>
// 						</CarouselItem>
// 					))}
// 				</CarouselContent>
// 				{/* <CarouselPrevious />
// 				<CarouselNext /> */}
// 			</Carousel>
// 		</div>
// 	);
// };

// interface PaymentFormProps {
// 	orderId: number;
// 	amount: number;
// 	paymentMethod: "online-payment" | "cod-payment";
// 	customerName: string;
// 	customerEmail: string;
// 	customerPhone: string;
// }

// Documentation: PaymentSection component displays payment details and allows for adding cash or online payments.
// const PaymentSection = ({
// 	order,
// 	orderTotalCouponCheckedPrice,
// }: {
// 	order: OrderProps;
// 	orderTotalCouponCheckedPrice: number | null;
// }) => {
// 	const { toast } = useToast();
// 	const { authToken } = useAuth();
// 	const [loading, setLoading] = useDisclosure();
// 	const [dueAmount, _setDueAmount] = useState<number>(
// 		order.orderTotalPrice -
// 			order.payments.reduce((acc, curr) => acc + curr.amount, 0)
// 	);

// 	const [paymentFormData, setPaymentFormData] = useState<PaymentFormProps>({
// 		orderId: order.orderId,
// 		amount: dueAmount,
// 		paymentMethod: order.paymentMethod,
// 		customerName: order.customerName,
// 		customerEmail: order.customerEmail,
// 		customerPhone: order.customerPhone,
// 	});
// 	const { validateForm, errors } = useFormValidation();

// 	const handleChange = (
// 		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
// 	) => {
// 		const { value } = e.target;

// 		if (order.payments.length > 0) {
// 			return;
// 		}

// 		setPaymentFormData((prevData) => ({
// 			...prevData,
// 			amount: Number(value),
// 		}));
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		try {
// 			setLoading.open();
// 			e.preventDefault();

// 			if (
// 				paymentFormData.amount > 0 &&
// 				validateForm(paymentFormData, orderService.paymentCreationSchema)
// 			) {
// 				if (!authToken) return;
// 				console.log(paymentFormData);

// 				// const response = await orderService.createPayment(
// 				// 	authToken,
// 				// 	paymentFormData.amount,
// 				// 	paymentFormData.orderId,
// 				// 	paymentFormData.paymentMethod,
// 				// 	paymentFormData.customerName,
// 				// 	paymentFormData.customerEmail,
// 				// 	paymentFormData.customerPhone
// 				// );

// 				// if (response.status === 201) {
// 				// 	toast({
// 				// 		description: "Payment request created successfully.",
// 				// 		variant: "success",
// 				// 		duration: 10000,
// 				// 	});

// 				// 	fetchOrder();
// 				// }
// 			}
// 		} catch (err: any) {
// 			setLoading.close();
// 			console.log(err.message);
// 			toast({
// 				description: err.message,
// 				variant: "destructive",
// 				duration: 10000,
// 			});
// 		} finally {
// 			setLoading.close();
// 		}
// 	};

// 	const suggestedPayment = Math.floor(order.orderTotalPrice * 0.25); // 25% of total amount

// 	return (
// 		<div className="bg-gray-50 py-4 rounded-lg">
// 			<div className="space-y-4">
// 				<div className="grid gap-4 md:grid-cols-2">
// 					<div>
// 						<p className="text-sm mb-1">Total Order Amount</p>
// 						<p className="font-semibold text-lg">
// 							{orderTotalCouponCheckedPrice
// 								? orderTotalCouponCheckedPrice.toLocaleString()
// 								: "Calculating"}
// 							{" " + currencyCode}
// 							{orderTotalCouponCheckedPrice !== order.orderTotalPrice && (
// 								<span className="text-sm text-neutral-500">
// 									{" "}
// 									({order.orderTotalPrice.toLocaleString()}
// 									{" " + currencyCode})
// 								</span>
// 							)}
// 						</p>
// 					</div>
// 					{order.payments.length > 0 ? (
// 						<div className="flex flex-col gap-2">
// 							<div>
// 								<p className="text-sm mb-1">Payment History</p>
// 								{order.payments.map((payment) => (
// 									<p key={payment.paymentId} className="text-sm space-y-1">
// 										<span className="font-semibold text-lg">
// 											{payment.isPaid
// 												? `Paid ${payment.amount.toLocaleString()} ${currencyCode} `
// 												: `Pending ${payment.amount.toLocaleString()} ${currencyCode} `}
// 										</span>
// 										at {new Date(payment.createdAt).toDateString()}
// 									</p>
// 								))}
// 							</div>
// 						</div>
// 					) : (
// 						<div>
// 							<p className="text-sm  mb-1">Suggested Initial Payment (25%)</p>
// 							<p className="font-semibold text-lg">
// 								{suggestedPayment.toLocaleString()}
// 								{" " + currencyCode}
// 							</p>
// 						</div>
// 					)}
// 				</div>

// 				{order.paymentMethod === "online-payment" && (
// 					<>
// 						{/* STEP 1: Show payment link only if no payment is paid */}
// 						{order.payments.length > 0 &&
// 							order.payments.some((payment) => !payment.isPaid) && (
// 								<div className="space-y-1">
// 									<p className="text-sm mb-1">
// 										Customer has not paid yet. Copy the link below and complete
// 										the payment.
// 									</p>
// 									<Button
// 										onClick={() => {
// 											if (
// 												order.payments.filter(
// 													(payment) => !payment.isPaid && payment.paymentLink
// 												).length > 0
// 											) {
// 												document.execCommand(
// 													"copy",
// 													false,
// 													order.payments.filter(
// 														(payment) => !payment.isPaid && payment.paymentLink
// 													)[0].paymentLink as any
// 												);
// 												toast({
// 													description: "Payment link copied to clipboard.",
// 													variant: "success",
// 													duration: 10000,
// 												});
// 											}
// 										}}
// 									>
// 										<Clipboard /> Copy Payment Link
// 									</Button>
// 								</div>
// 							)}

// 						{/* STEP 2: Show input only if at least one payment is paid and not fully paid */}
// 						{((order.payments.some(
// 							(payment) => payment.isPaid || payment.paymentLink
// 						) &&
// 							order.payments
// 								.filter((payment) => payment.isPaid || payment.paymentLink)
// 								.reduce((acc, curr) => acc + curr.amount, 0) <
// 								order.orderTotalPrice) ||
// 							order.payments.length === 0) && (
// 							<div className="flex w-full gap-4 items-start flex-col">
// 								{loading && (
// 									<LoadingOverlay
// 										visible={loading}
// 										zIndex={10}
// 										overlayProps={{ radius: "xs", blur: 1 }}
// 									/>
// 								)}

// 								<div className="w-full space-y-1">
// 									<label htmlFor="payment" className="font-semibold block mb-1">
// 										Add Online Payment <span className="text-skyblue">*</span>
// 									</label>
// 									<Input
// 										id="payment"
// 										type="number"
// 										step="1"
// 										min="0"
// 										max={dueAmount}
// 										name="amount"
// 										value={paymentFormData.amount}
// 										onChange={handleChange}
// 										placeholder="Enter payment amount"
// 										className="w-full input-type-number"
// 										error={errors.amount ? true : false}
// 									/>
// 									{errors.amount && (
// 										<p className="text-rose-500 text-sm">{errors.amount}</p>
// 									)}
// 								</div>
// 								<Button onClick={handleSubmit}>Add Payment</Button>
// 							</div>
// 						)}
// 					</>
// 				)}

// 				{order.paymentMethod === "cod-payment" &&
// 					order.paymentStatus !== "paid" &&
// 					order.payments.length < 2 && ( // show input only if less than 2 installments
// 						<div className="flex w-full gap-4 items-start flex-col">
// 							{loading && (
// 								<LoadingOverlay
// 									visible={loading}
// 									zIndex={10}
// 									overlayProps={{ radius: "xs", blur: 1 }}
// 								/>
// 							)}

// 							<div className="w-full space-y-1">
// 								<label htmlFor="payment" className="font-semibold block mb-1">
// 									Add Cash Payment <span className="text-skyblue">*</span>
// 								</label>
// 								<Input
// 									id="payment"
// 									type="number"
// 									step="1"
// 									min="0"
// 									max={dueAmount}
// 									name="amount"
// 									value={paymentFormData.amount}
// 									onChange={handleChange}
// 									placeholder="Enter payment amount"
// 									className="w-full input-type-number"
// 									error={errors.amount ? true : false}
// 								/>
// 								{errors.amount && (
// 									<p className="text-rose-500 text-sm">{errors.amount}</p>
// 								)}
// 							</div>
// 							<Button onClick={handleSubmit}>Cash Received</Button>
// 						</div>
// 					)}
// 			</div>
// 		</div>
// 	);
// };

export default ActiveOrder;
