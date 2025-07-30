// Documentation: This component displays a list of completed orders, allowing users to search, filter, export, and manage visible table columns.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet, FileText } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import ColumnManager from "@/components/ui/ColumnManager";
import { useOrders } from "@/hooks/use-order";
import { useToast } from "@/hooks/use-toast";
import  { useEffect, useState } from "react";
import { createCSV, createExcelSheet } from "@/lib/utils";
// Documentation: Corrected import path for OrderTable to be a sibling component within src/pages/order.
import OrderTable from "./OrderTable";
// Documentation: Corrected import path for OrderViewDialog to be relative to src/pages/order/dialogs.
// import OrderViewDialog from "./dialogs/OrderViewDialog";
// Documentation: Corrected import path for ProductDetailSheet to be relative to src/pages/order/dialogs.
// import ProductDetailSheet from "./dialogs/ProductDetailSheet";

const CompletedOrder = () => {
	// State to manage visible columns in the table
	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"orderId",
		"customerName",
		"email",
		"phone",
		"orderDetails",
		"totalAmount",
		"paymentMethod",
		"paymentStatus",
		"deliveryMethod",
		"deliveryDate",
		"status",
		"method",
		"agentName",
		"agentNumber",
		"orderDate",
		"action",
	]);

	// Array of all possible columns for the column manager
	const allColumns = [
		{ key: "orderId", label: "Order ID" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "email", label: "Email" },
		{ key: "phone", label: "Phone" },
		{ key: "orderDetails", label: "Order Details" },
		{ key: "totalAmount", label: "Total Amount" },
		{ key: "paymentMethod", label: "Payment Method" },
		{ key: "paymentStatus", label: "Payment Status" },
		{ key: "deliveryMethod", label: "Delivery Method" },
		{ key: "deliveryDate", label: "Est. Delivery Date" },
		{ key: "status", label: "Order Status" },
		{ key: "method", label: "Order Mode" },
		{ key: "agentName", label: "Agent Name" },
		{ key: "agentNumber", label: "Agent Number" },
		{ key: "orderDate", label: "Order Date" },
		{ key: "action", label: "Action" },
	];

	const {
		orders,
		setSearchTerm,
		searchBy,
		setSearchBy,
		setFilteredBy,
		setLimit,
		error,
	} = useOrders();
	const [searchValue, setSearchValue] = useState<string>("");
	const { toast } = useToast();

	// Documentation: Sets the filter for completed orders. This effect runs only once on component mount
	// to prevent re-fetching and potential table flickering issues.
	useEffect(() => {
		setFilteredBy("completed");
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

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchValue); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchValue, setSearchTerm]);

	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = orders.map((order) => ({
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
			"Total Amount": order.orderTotalPrice,
			"Payment Method": order.paymentMethod,
			"Payment Status": order.paymentStatus,
			"Delivery Method": order.deliveryMethod,
			"Est. Delivery": order.deliveryDate,
			"Current Status": order.currentStatus,
			Source: order.method,
			// The staff filtering here is for export data, not directly for table display.
			"Agent Name":
				(order as any).staff?.filter(
					(staffItem: any) => staffItem.staffId === order.staffId
				)[0]?.name ?? "N/A",
			"Agent Number":
				(order as any).staff?.filter(
					(staffItem: any) => staffItem.staffId === order.staffId
				)[0]?.phone ?? "N/A",
			"Date Added": new Date(order.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "completed-orders");
		} else if (format === "csv") {
			createCSV(worksheetData, "completed-orders");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Header */}
			<Header
				title="Completed Orders"
				description="All the completed orders of your store in one place!"
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
			{orders.length > 0 && (
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
						{/* Documentation: ColumnManager component allows users to select which columns are visible in the table. */}
						<ColumnManager
							allColumns={allColumns}
							visibleColumns={visibleColumns}
							setVisibleColumns={setVisibleColumns}
						/>
					</div>

					<div className="flex items-center justify-between gap-3">
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
					</div>
				</div>
			)}

			{/* orders tabs */}
			{orders.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					{/* Documentation: The main order table is now encapsulated in the OrderTable component. */}
					<OrderTable orders={orders} visibleColumns={visibleColumns} />
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No order found</p>
				</div>
			)}
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

// Documentation: PaymentSection component displays payment details and allows for adding cash or online payments.
// const PaymentSection = ({
// 	order,
// 	orderTotalCouponCheckedPrice,
// }: {
// 	order: OrderProps;
// 	orderTotalCouponCheckedPrice: number | null;
// }) => {
// 	const { toast } = useToast();

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
// 						{/* {((order.payments.some((payment) => payment.isPaid) &&
// 							order.payments
// 								.filter((payment) => payment.isPaid)
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
// 						)} */}
// 					</>
// 				)}

// 				{/* {order.paymentMethod === "cod-payment" &&
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
// 					)} */}
// 			</div>
// 		</div>
// 	);
// };

// Documentation: Corrected export name to match the file name.
export default CompletedOrder;
