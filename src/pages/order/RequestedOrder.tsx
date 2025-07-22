import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pen,
	Search,
	Trash,
	MoreHorizontal,
	Clock,
	CalendarIcon,
	Package,
	User,
	Mail,
	Phone,
	Eye,
	ExternalLink,
	Clipboard,
	MapPin,
	FileSpreadsheet,
	FileText,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableCaption,
} from "@/components/ui/table";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/header";
import { Link } from "react-router-dom";
import {
	OrderImageProps,
	OrderItemProps,
	OrderProps,
	useOrders,
} from "@/hooks/use-order";
import { currencyCode } from "@/config";
import { useStaff } from "@/hooks/use-staff";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, createCSV, createExcelSheet } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { differenceInHours, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ChangeEvent, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { useCoupons } from "@/hooks/use-coupon";
import { LoadingOverlay } from "@mantine/core";
import { AppPagination } from "@/components/ui/app-pagination";
import { useFormValidation } from "@/hooks/use-form-validation";
import { orderService } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useDisclosure } from "@mantine/hooks";
import { useCouriers } from "@/hooks/use-courier";

const RequestedOrder = () => {
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
	const { staff } = useStaff();
	const { toast } = useToast();

	useEffect(() => {
		setFilteredBy("requested");
	}, [orders]);

	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, []);

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchValue); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchValue]);

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
			"Agent Name":
				staff.filter((staffItem) => staffItem.staffId === order.staffId)[0]
					?.name ?? "N/A",
			"Agent Number":
				staff.filter((staffItem) => staffItem.staffId === order.staffId)[0]
					?.phone ?? "N/A",
			"Date Added": new Date(order.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "requested-orders");
		} else if (format === "csv") {
			createCSV(worksheetData, "requested-orders");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Header */}
			<Header
				title="Requested Orders"
				description="All the requested orders of your store in one place!"
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
						{/* <Button variant="destructive">
							<Trash size={15} />
							Delete Selected
						</Button> */}
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
					<RenderTable orders={orders} />
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No order found</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({ orders }: { orders: OrderProps[] }) => {
	const { loading, totalPages, page, setPage } = useOrders();
	const { staff } = useStaff();
	const { checkCoupon } = useCoupons();
	const [orderViewDialogId, setOrderViewDialogId] = useState<number | null>(
		null
	);
	const [orderTotalCouponCheckedPrices, setOrderTotalCouponCheckedPrices] =
		useState<Record<number, number>>({});

	const getCouponCheckedPrice = async (
		couponId: number,
		orderTotalPrice: number
	): Promise<number> => {
		try {
			// Maybe show loading spinner here manually if you want
			const result = await checkCoupon(couponId, orderTotalPrice);
			return result.discountedPrice ?? orderTotalPrice; // If no discount, fallback
		} catch (err: any) {
			console.error(err.message);
			return orderTotalPrice; // Fallback to original price on error
		}
	};

	useEffect(() => {
		orders.forEach(async (order) => {
			// Assuming each order might have a couponId and you want to call for all
			if (order.couponId) {
				const couponAppliedPrice = await getCouponCheckedPrice(
					order.couponId,
					order.orderTotalPrice
				);
				setOrderTotalCouponCheckedPrices((prev) => ({
					...prev,
					[order.orderId]: couponAppliedPrice,
				}));
			} else {
				// If no coupon, just use normal total
				setOrderTotalCouponCheckedPrices((prev) => ({
					...prev,
					[order.orderId]: order.orderTotalPrice,
				}));
			}
		});
	}, [orders]);

	return (
		<div className="w-full border border-neutral-200 rounded-lg">
			<Table className="border-collapse px-0 w-full">
				<TableCaption className="py-4 border border-t border-neutral-200">
					Showing {orders.length} entries from
					<div className="w-full text-black">
						{totalPages > 1 && (
							<AppPagination
								page={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						)}
					</div>
				</TableCaption>
				<TableHeader>
					<TableRow className="bg-slate-100 hover:bg-slate-100">
						<TableHead className="pl-5">
							<Checkbox />
						</TableHead>
						<TableHead>OrderID</TableHead>
						<TableHead>Customer Name</TableHead>
						<TableHead>Customer Email</TableHead>
						<TableHead>Customer Phone</TableHead>
						<TableHead>Order Items</TableHead>
						<TableHead>Total Price ({currencyCode})</TableHead>
						<TableHead>Payment Method</TableHead>
						<TableHead>Payment Status</TableHead>
						<TableHead>Delivery Method</TableHead>
						<TableHead>Est. Delivery</TableHead>
						<TableHead>Current Status</TableHead>
						<TableHead>Source</TableHead>
						<TableHead>Agent Name</TableHead>
						<TableHead>Agent Number</TableHead>
						<TableHead>Date Added</TableHead>
						<TableHead className="w-[60px] pr-5">Actions</TableHead>
					</TableRow>
				</TableHeader>
				{loading ? (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
						/>
					</>
				) : (
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.orderId}>
								<TableCell className="pl-5">
									<Checkbox />
								</TableCell>
								<TableCell>#{order.orderId}</TableCell>
								<TableCell>{order.customerName}</TableCell>
								<TableCell>{order.customerEmail}</TableCell>
								<TableCell>{order.customerPhone}</TableCell>
								<TableCell>{order.orderItems.length}</TableCell>
								<TableCell>
									{orderTotalCouponCheckedPrices[order.orderId] != null
										? `${orderTotalCouponCheckedPrices[
												order.orderId
										  ].toLocaleString()} ${currencyCode}`
										: "Calculating..."}
								</TableCell>
								<TableCell>
									{order.paymentMethod === "cod-payment" ? "COD" : "Online"}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											order.paymentStatus === "paid"
												? "success"
												: order.paymentStatus === "partial"
												? "default"
												: "destructive"
										}
										size="sm"
									>
										{order.paymentStatus}
									</Badge>
								</TableCell>

								<TableCell>{order.deliveryMethod}</TableCell>
								<TableCell>
									{order.deliveryDate
										? new Date(order.deliveryDate).toDateString()
										: "N/A"}
								</TableCell>
								<TableCell>
									<Badge size="sm" variant={order.status as any}>
										{order.status.split("-").join(" ")}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										size="sm"
										variant={
											order.method === "online" ? "success" : "secondary"
										}
									>
										{order.method}
									</Badge>
								</TableCell>
								<TableCell>
									{staff.filter(
										(staffItem) => staffItem.staffId === order.staffId
									)[0]?.name ?? "N/A"}
								</TableCell>
								<TableCell>
									{staff.filter(
										(staffItem) => staffItem.staffId === order.staffId
									)[0]?.phone ?? "N/A"}
								</TableCell>
								<TableCell>
									{new Date(order.createdAt).toDateString()}
								</TableCell>

								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost">
												<MoreHorizontal />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuGroup>
												<DropdownMenuItem
													onClick={() => setOrderViewDialogId(order.orderId)}
												>
													<Eye />
													View
												</DropdownMenuItem>

												<DropdownMenuItem
													className="text-rose-500"
													// onClick={() => setDeleteDialogOpenId(order.id)}
												>
													<Trash />
													Delete
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>

									<OrderViewDialog
										order={order}
										open={orderViewDialogId === order.orderId}
										setOpen={setOrderViewDialogId}
									/>
									{/* <OrderDeleteDialog

								{/* product item delete dialog */}
									{/* <ProductDeleteDialog
								product={order}
								deleteDialogOpenId={deleteDialogOpenId}
								setDeleteDialogOpenId={setDeleteDialogOpenId}
							/> */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				)}
			</Table>
		</div>
	);
};

interface OrderDetailsFormProps {
	deliveryDate: Date | null;
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
	courierAddress: string | null;
	additionalNotes: string;
}

interface OrderViewDialogProps {
	order: OrderProps;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<number | null>>;
}

const OrderViewDialog = ({ order, open, setOpen }: OrderViewDialogProps) => {
	const { fetchOrder } = useOrders();
	const { toast } = useToast();
	const { staff } = useStaff();
	const { checkCoupon } = useCoupons();
	const { couriers } = useCouriers();
	const { authToken } = useAuth();
	const [loading, setLoading] = useDisclosure();
	const [appliedCoupon, setAppliedCoupon] = useState<string>("N/A");
	const [orderTotalCouponCheckedPrice, setOrderTotalCouponCheckedPrice] =
		useState<number | null>(null);
	const [selectedItem, setSelectedItem] = useState<any>(null);

	if (!order) return null;

	const getDeliveryDateStyle = (deliveryDate: string | null | undefined) => {
		if (!deliveryDate) return "text-gray-400";

		const date = new Date(deliveryDate);
		if (!isValid(date)) return "text-gray-400";

		const hoursUntilDelivery = differenceInHours(date, new Date());

		if (hoursUntilDelivery <= 24) {
			return "text-red-500 font-medium";
		}
		if (hoursUntilDelivery <= 48) {
			return "text-orange-500 font-medium";
		}
		return "";
	};

	const [orderDetailsFormData, setOrderDetailFormData] =
		useState<OrderDetailsFormProps>({
			status: order.status,
			deliveryDate: order.deliveryDate,
			courierAddress: order.courierAddress,
			additionalNotes: order.additionalNotes,
		});

	const [isEdited, setIsEdited] = useState(false);

	const handleStatusChange = (newStatus: string) => {
		setOrderDetailFormData((prevData) => ({
			...prevData,
			status: newStatus as any,
		}));
		setIsEdited(true);
	};

	const handleDeliveryDateChange = (date: Date | undefined) => {
		if (date) {
			setOrderDetailFormData((prevData) => ({
				...prevData,
				deliveryDate: date,
			}));
			setIsEdited(true);
		}
	};

	const handleAddressUpdate = (value: string) => {
		setOrderDetailFormData((prevData) => ({
			...prevData,
			courierAddress: value,
		}));
		setIsEdited(true);
	};

	const handleNotesUpdate = (value: string) => {
		setOrderDetailFormData((prevData) => ({
			...prevData,
			additionalNotes: value,
		}));
		setIsEdited(true);
	};

	const handleSave = async () => {
		try {
			setLoading.open();
			if (!authToken) return;

			const response = await orderService.updateOrder(
				authToken,
				order.orderId,
				orderDetailsFormData.deliveryDate,
				orderDetailsFormData.status,
				orderDetailsFormData.courierAddress,
				orderDetailsFormData.additionalNotes
			);

			if (response.status === 200) {
				toast({
					description: "Order updated successfully.",
					variant: "success",
					duration: 10000,
				});

				fetchOrder();
			}
		} catch (err: any) {
			setLoading.close();
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	const orderStatuses = [
		"order-request-received",
		"consultation-in-progress",
		"order-canceled",
		"awaiting-advance-payment",
		"advance-payment-received",
		"design-in-progress",
		"awaiting-design-approval",
		"production-started",
		"production-in-progress",
		"ready-for-delivery",
		"out-for-delivery",
		"order-completed",
	];

	useEffect(() => {
		const getCouponCheckedPrice = async (
			couponId: number | null,
			totalPrice: number
		) => {
			setOrderTotalCouponCheckedPrice(totalPrice);
			if (!couponId) return;

			try {
				// Maybe show loading spinner here manually if you want
				const result = await checkCoupon(couponId, totalPrice);
				setOrderTotalCouponCheckedPrice(result.discountedPrice ?? totalPrice);
				if (result.coupon) {
					setAppliedCoupon(result.coupon.code);
				}
				// return result.discountedPrice ?? totalPrice; // If no discount, fallback
			} catch (err: any) {
				console.log(err.message);
			}
		};

		getCouponCheckedPrice(order.couponId, order.orderTotalPrice);
	}, [order]);

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				setOpen(open ? order.orderId : null);
			}}
		>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
				{loading && (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
							className="h-full min-h-[100vh] w-full"
						/>
					</>
				)}

				<DialogHeader className="flex flex-row items-start justify-between mt-4 mb-2">
					<DialogTitle className="text-2xl font-bold">
						Order #{order.orderId}
					</DialogTitle>
					<div className="flex gap-3 items-start">
						<p className="font-bold">Agent: </p>
						<div className="w-full flex flex-col gap-1 text-right">
							<p className=" text-sm">
								{staff.filter(
									(staffItem) => staffItem.staffId === order.staffId
								)[0]?.name ?? "Unassigned"}
							</p>
							<p className=" text-sm">
								{staff.filter(
									(staffItem) => staffItem.staffId === order.staffId
								)[0]?.phone ?? "N/A"}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2 ">
								<Clock className="h-4 w-4" />
								<span>Order Date:</span>
								<span className="font-medium text-black">
									{new Date(order.createdAt).toDateString()}
								</span>
							</div>
							<div className="flex items-center gap-2 ">
								<CalendarIcon className="h-4 w-4" />
								<span>Est. Delivery:</span>
								{orderDetailsFormData.deliveryDate ? (
									<span className="font-medium text-black">
										{new Date(orderDetailsFormData.deliveryDate).toDateString()}
									</span>
								) : (
									<div className="flex gap-2 items-center">
										<span className="text-gray-400">N/A</span>

										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													// size="sm"
													className={cn(
														order.deliveryDate &&
															getDeliveryDateStyle(
																new Date(order.deliveryDate).toDateString()
															),
														"font-normal"
													)}
												>
													{order.deliveryDate &&
														new Date(order.deliveryDate).toDateString()}
													Set Date
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													// selected={new Date(order?.deliveryDate)}
													onSelect={handleDeliveryDateChange}
													initialFocus
													disabled={(date) =>
														date < new Date(new Date().setHours(0, 0, 0, 0))
													}
													className={cn("p-3 pointer-events-auto")}
												/>
											</PopoverContent>
										</Popover>
									</div>
								)}
							</div>
							<div className="flex items-center gap-2 ">
								<Package className="h-4 w-4" />
								<span>Status:</span>
								<Select
									defaultValue={orderDetailsFormData.status}
									onValueChange={handleStatusChange}
								>
									<SelectTrigger className="w-max">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent className="h-max">
										{orderStatuses.map((status) => (
											<SelectItem key={status} value={status}>
												{status.replace(/-/g, " ").toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2 ">
								<Package className="h-4 w-4" />
								<span>Payment Status:</span>
								<Badge
									variant={
										order.paymentStatus === "paid"
											? "success"
											: order.paymentStatus === "pending"
											? "destructive"
											: "default"
									}
									size="sm"
								>
									{order.paymentStatus}
								</Badge>
							</div>
							<div className="flex items-center gap-2 ">
								<Package className="h-4 w-4" />
								<span>Payment Method:</span>
								<span className="font-medium text-black">
									{order.paymentMethod.replace(/-/g, " ")}
								</span>
							</div>

							<div className="flex items-center gap-2 ">
								<Package className="h-4 w-4" />
								<span>Coupon Applied:</span>
								<span className="font-medium text-black">
									{order.couponId ? (
										<Badge size="sm" variant="success">
											{appliedCoupon}
										</Badge>
									) : (
										"N/A"
									)}
								</span>
							</div>
						</div>
					</div>

					<Separator className="bg-neutral-500/30" />

					<div className="space-y-2">
						<h3 className="text-lg font-semibold mb-2">Payment Details</h3>
						<PaymentSection
							order={order}
							orderTotalCouponCheckedPrice={orderTotalCouponCheckedPrice}
							// onPaymentSubmit={handlePaymentSubmit}
						/>
					</div>

					<Separator className="bg-neutral-500/30" />

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Customer Information</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2 ">
									<User className="h-4 w-4" />
									<span>Name:</span>
									<span className="font-medium text-black">
										{order.customerName}
									</span>
								</div>
								<div className="flex items-center gap-2 ">
									<Mail className="h-4 w-4" />
									<span>Email:</span>
									<span className="font-medium text-black">
										{order.customerEmail}
									</span>
								</div>
								<div className="flex items-center gap-2 ">
									<Phone className="h-4 w-4" />
									<span>Phone:</span>
									<span className="font-medium text-black">
										{order.customerPhone}
									</span>
								</div>
							</div>
							<div className="space-y-4">
								<div className="flex flex-col gap-2 ">
									<div className="flex items-center gap-2 font-semibold">
										<MapPin className="h-4 w-4" />
										<span>Billing Address:</span>
									</div>
									<span className="text-neutral-600">
										{order.billingAddress}
									</span>
								</div>
								<div className="flex  gap-2 ">
									<div className="flex items-center gap-2 font-semibold">
										<MapPin className="h-4 w-4" />
										<span>Shipping Address:</span>
									</div>
									<span className="text-neutral-600">
										{order.deliveryMethod === "shop-pickup"
											? "Shop Pickup"
											: `${
													order.deliveryMethod === "courier" &&
													order.courierId &&
													couriers.filter(
														(courier) => courier.courierId === order.courierId
													)[0]?.name
											  }`}
									</span>
								</div>
								{orderDetailsFormData.courierAddress && (
									<EditableField
										label="Courier Address"
										value={orderDetailsFormData.courierAddress}
										onSave={(value) => handleAddressUpdate(value)}
									/>
								)}
							</div>
						</div>
					</div>

					<Separator className="bg-neutral-500/30" />

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Order Items</h3>
						<Table>
							<TableBody>
								{order.orderItems.map((item: OrderItemProps) => (
									<TableRow
										key={item.orderItemId}
										className="cursor-pointer hover:bg-gray-50"
										onClick={() => setSelectedItem(item)}
									>
										<TableCell>
											<div className="flex items-center gap-4">
												<div>
													<p className="font-semibold truncate">
														{item?.product?.name?.slice(0, 40) ||
															item?.unlistedProduct?.name?.slice(0, 40)}
														{item?.product
															? item?.product?.name?.length > 40 && "..."
															: item?.unlistedProduct
															? item?.unlistedProduct?.name?.length > 40 &&
															  "..."
															: ""}{" "}
													</p>
													<div className="text-sm text-gray-500 mt-1">
														SKU:{" "}
														<span className="text-skyblue">
															{item?.product?.sku || "N/A"}{" "}
														</span>
														{item?.productVariant &&
															item?.productVariant.variantDetails.map(
																(detail: any) => (
																	<span
																		key={detail.productVariantDetailId}
																		className="mr-2"
																	>
																		{detail.variationItem.variation.name}:{" "}
																		{detail.variationItem.value}{" "}
																		{detail.variationItem.variation.unit}{" "}
																		{item.widthInch && item.heightInch && (
																			<span className="text-xs text-neutral-600">
																				{item.widthInch} inch x{" "}
																				{item.heightInch} inch
																			</span>
																		)}
																	</span>
																)
															)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											Qty: {item.quantity} (
											{item.quantity > 1 ? "pieces" : "piece"})
										</TableCell>
										<TableCell>
											Size:{" "}
											{item.size
												? `${item.size.toLocaleString()} sqfeet.`
												: "N/A"}
										</TableCell>
										<TableCell className="text-right">
											{Number(item.price).toLocaleString()}
											{" " + currencyCode}
										</TableCell>
									</TableRow>
								))}
								<TableRow>
									<TableCell className=""></TableCell>
									<TableCell className=""></TableCell>
									<TableCell>Coupon Applied: </TableCell>
									<TableCell className="text-right">
										-{" "}
										{orderTotalCouponCheckedPrice
											? (
													order.orderTotalPrice - orderTotalCouponCheckedPrice
											  ).toLocaleString()
											: "Calculating"}
										{" " + currencyCode}
									</TableCell>
								</TableRow>

								<TableRow>
									<TableCell className=""></TableCell>
									<TableCell className=""></TableCell>
									<TableCell>Total Price: </TableCell>
									<TableCell className="text-right">
										{orderTotalCouponCheckedPrice
											? orderTotalCouponCheckedPrice.toLocaleString()
											: "Calculating"}
										{" " + currencyCode}
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<Separator className="bg-neutral-500/30" />
					<div className="space-y-2">
						<EditableField
							label="Additional Notes"
							value={orderDetailsFormData.additionalNotes}
							onSave={handleNotesUpdate}
						/>
					</div>

					<Separator className="bg-neutral-500/30" />

					<OrderImageSlider images={order.images} />
				</div>

				<DialogFooter className="flex justify-between">
					<div className="w-full flex justify-end gap-4">
						<Link to={`/invoice/${order.orderId}`} target="_blank">
							<Button variant="outline" className="gap-2">
								<ExternalLink />
								View Invoice
							</Button>
						</Link>

						<Button onClick={handleSave} disabled={!isEdited}>
							Save
						</Button>
					</div>
				</DialogFooter>

				{selectedItem && (
					<ProductDetailSheet
						isOpen={!!selectedItem}
						onClose={() => setSelectedItem(null)}
						item={selectedItem}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

interface EditableFieldProps {
	value: string;
	label: string;
	onSave: (value: string) => void;
}

const EditableField = ({ value, label, onSave }: EditableFieldProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);

	const handleSave = () => {
		onSave(editValue);
		setIsEditing(false);
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-col items-start justify-between gap-1">
				<span className="font-semibold flex-grow">{label}:</span>
				{isEditing ? (
					<div className="w-full flex-grow space-y-3">
						<Textarea
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							className="min-h-[100px] w-full"
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={handleSave}>
								Save
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between w-full">
						<p className="text-neutral-600 flex-grow">{value}</p>
						<Button
							variant="ghost"
							size="sm"
							className="opacity-100"
							onClick={() => setIsEditing(true)}
						>
							<Pen size={12} />
							Edit
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

const OrderImageSlider = ({ images }: { images: OrderImageProps[] }) => {
	if (!images.length) return null;

	return (
		<div className="w-full">
			<h3 className="text-lg font-semibold mb-4">Order Images</h3>
			<Carousel className="w-full">
				<CarouselContent>
					{images.map((image, index) => (
						<CarouselItem key={index} className="md:basis-1/4">
							<div className="p-1">
								<div className="rounded-lg overflow-hidden aspect-square">
									<img
										src={image.imageUrl}
										alt={`Order item ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				{/* <CarouselPrevious />
				<CarouselNext /> */}
			</Carousel>
		</div>
	);
};

interface PaymentSectionProps {
	order: OrderProps;
	orderTotalCouponCheckedPrice: number | null;
	// onPaymentSubmit: (amount: number) => void;
}

interface PaymentFormProps {
	orderId: number;
	amount: number;
	paymentMethod: "online-payment" | "cod-payment";
	customerName: string;
	customerEmail: string;
	customerPhone: string;
}

const PaymentSection = ({
	order,
	orderTotalCouponCheckedPrice,
}: PaymentSectionProps) => {
	const { fetchOrder } = useOrders();
	const { toast } = useToast();
	const { authToken } = useAuth();
	const [loading, setLoading] = useDisclosure();
	const [dueAmount, _setDueAmount] = useState<number>(
		order.orderTotalPrice -
			order.payments
				.filter((payment) => payment.isPaid)
				.reduce((acc, curr) => acc + curr.amount, 0)
	);

	const [paymentFormData, setPaymentFormData] = useState<PaymentFormProps>({
		orderId: order.orderId,
		amount: dueAmount,
		paymentMethod: order.paymentMethod,
		customerName: order.customerName,
		customerEmail: order.customerEmail,
		customerPhone: order.customerPhone,
	});
	const { validateForm, errors } = useFormValidation();

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { value } = e.target;

		if (order.payments.length > 0) {
			return;
		}

		setPaymentFormData((prevData) => ({
			...prevData,
			amount: Number(value),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			setLoading.open();
			e.preventDefault();

			if (
				paymentFormData.amount > 0 &&
				validateForm(paymentFormData, orderService.paymentCreationSchema)
			) {
				if (!authToken) return;

				const response = await orderService.createPayment(
					authToken,
					paymentFormData.amount,
					paymentFormData.orderId,
					paymentFormData.paymentMethod,
					paymentFormData.customerName,
					paymentFormData.customerEmail,
					paymentFormData.customerPhone
				);

				if (response.status === 201) {
					toast({
						description: "Payment request created successfully.",
						variant: "success",
						duration: 10000,
					});

					fetchOrder();
				}
			}
		} catch (err: any) {
			setLoading.close();
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	const suggestedPayment = Math.floor(order.orderTotalPrice * 0.25); // 25% of total amount

	return (
		<div className="bg-gray-50 py-4 rounded-lg">
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<p className="text-sm mb-1">Total Order Amount</p>
						<p className="font-semibold text-lg">
							{orderTotalCouponCheckedPrice
								? orderTotalCouponCheckedPrice.toLocaleString()
								: "Calculating"}
							{" " + currencyCode}
							{orderTotalCouponCheckedPrice !== order.orderTotalPrice && (
								<span className="text-sm text-neutral-500">
									{" "}
									({order.orderTotalPrice.toLocaleString()}
									{" " + currencyCode})
								</span>
							)}
						</p>
					</div>
					{order.payments.length > 0 ? (
						<div className="flex flex-col gap-2">
							{order.payments.map((payment) => (
								<div key={payment.paymentId}>
									<p className="text-sm  mb-1">Payment History</p>
									<p className="text-sm">
										<span className="font-semibold text-lg">
											{payment.isPaid
												? `Paid ${payment.amount.toLocaleString()} ${currencyCode} `
												: `Pending ${payment.amount.toLocaleString()} ${currencyCode} `}
										</span>
										at {new Date(payment.createdAt).toDateString()}
									</p>
								</div>
							))}
						</div>
					) : (
						<div>
							<p className="text-sm  mb-1">Suggested Initial Payment (25%)</p>
							<p className="font-semibold text-lg">
								{suggestedPayment.toLocaleString()}
								{" " + currencyCode}
							</p>
						</div>
					)}
				</div>

				{order.paymentMethod === "online-payment" && (
					<>
						{/* STEP 1: Show payment link only if no payment is paid */}
						{order.payments.length > 0 &&
							order.payments.some((payment) => !payment.isPaid) && (
								<div className="space-y-1">
									<p className="text-sm mb-1">
										Customer has not paid yet. Copy the link below and complete
										the payment.
									</p>
									<Button
										onClick={() => {
											if (
												order.payments.filter(
													(payment) => !payment.isPaid && payment.paymentLink
												).length > 0
											) {
												navigator.clipboard.writeText(
													order.payments.filter(
														(payment) => !payment.isPaid && payment.paymentLink
													)[0].paymentLink as any
												);
												toast({
													description: "Payment link copied to clipboard.",
													variant: "success",
													duration: 10000,
												});
											}
										}}
									>
										<Clipboard /> Copy Payment Link
									</Button>
								</div>
							)}

						{/* STEP 2: Show input only if at least one payment is paid and not fully paid */}
						{((order.payments.some(
							(payment) => payment.isPaid && payment.paymentLink
						) &&
							order.payments
								.filter((payment) => payment.isPaid || payment.paymentLink)
								.reduce((acc, curr) => acc + curr.amount, 0) <
								order.orderTotalPrice) ||
							order.payments.length === 0) && (
							<div className="flex w-full gap-4 items-start flex-col">
								{loading && (
									<LoadingOverlay
										visible={loading}
										zIndex={10}
										overlayProps={{ radius: "xs", blur: 1 }}
									/>
								)}

								<div className="w-full space-y-1">
									<label htmlFor="payment" className="font-semibold block mb-1">
										Add Online Payment <span className="text-skyblue">*</span>
									</label>
									<Input
										id="payment"
										type="number"
										step="1"
										min="0"
										max={dueAmount}
										name="amount"
										value={paymentFormData.amount}
										onChange={handleChange}
										placeholder="Enter payment amount"
										className="w-full input-type-number"
										error={errors.amount ? true : false}
									/>
									{errors.amount && (
										<p className="text-rose-500 text-sm">{errors.amount}</p>
									)}
								</div>
								<Button onClick={handleSubmit}>Add Payment</Button>
							</div>
						)}
					</>
				)}

				{order.paymentMethod === "cod-payment" &&
					order.paymentStatus !== "paid" &&
					order.payments.length < 2 && ( // show input only if less than 2 installments
						<div className="flex w-full gap-4 items-start flex-col">
							{loading && (
								<LoadingOverlay
									visible={loading}
									zIndex={10}
									overlayProps={{ radius: "xs", blur: 1 }}
								/>
							)}

							<div className="w-full space-y-1">
								<label htmlFor="payment" className="font-semibold block mb-1">
									Add Cash Payment <span className="text-skyblue">*</span>
								</label>
								<Input
									id="payment"
									type="number"
									step="1"
									min="0"
									max={dueAmount}
									name="amount"
									value={paymentFormData.amount}
									onChange={handleChange}
									placeholder="Enter payment amount"
									className="w-full input-type-number"
									error={errors.amount ? true : false}
								/>
								{errors.amount && (
									<p className="text-rose-500 text-sm">{errors.amount}</p>
								)}
							</div>
							<Button onClick={handleSubmit}>Cash Received</Button>
						</div>
					)}
			</div>
		</div>
	);
};

interface ProductDetailSheetProps {
	isOpen: boolean;
	onClose: () => void;
	item: OrderItemProps;
}

const ProductDetailSheet = ({
	isOpen,
	onClose,
	item,
}: ProductDetailSheetProps) => {
	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>
						{item?.product?.name || item?.unlistedProduct?.name}
					</SheetTitle>
					<SheetDescription>
						SKU:{" "}
						<span className="text-skyblue">{item?.product?.sku || "N/A"} </span>
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-6">
					<div className="space-y-2">
						<h3 className="font-medium">Variation Details</h3>
						{item?.productVariant &&
							item?.productVariant.variantDetails.map((detail) => (
								<div
									key={detail.productVariantDetailId}
									className="flex justify-between text-sm"
								>
									<span className="text-gray-500">
										{detail.variationItem.variation.name}
									</span>
									<span>
										{detail.variationItem.value}{" "}
										{detail.variationItem.variation.unit}
									</span>
								</div>
							))}
					</div>

					<Separator className="bg-gray/50" />

					<div className="space-y-2">
						{item.size && (
							<>
								<div className="flex justify-between">
									<span className="font-medium">Size</span>
									<span className="text-base">
										{item.size ? item.size.toLocaleString() + " sqfeet" : "N/A"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Width</span>
									<span className="text-base">
										{item.widthInch
											? item.widthInch.toLocaleString() + " inch"
											: "N/A"}
									</span>
								</div>

								<div className="flex justify-between">
									<span className="font-medium">Height</span>
									<span className="text-base">
										{item.heightInch
											? item.heightInch.toLocaleString() + " inch"
											: "N/A"}
									</span>
								</div>
							</>
						)}

						<div className="flex justify-between">
							<span className="font-medium">Quantity</span>
							<span className="text-base">
								{item.quantity}
								{item.quantity > 1 ? " (pieces)" : " (piece)"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-medium">Price</span>
							<span className="text-base font-semibold">
								{Number(item.price).toLocaleString()}
								{" " + currencyCode}
							</span>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

// interface OrderDeleteDialogProps {
// 	order: OrderProps;
// 	deleteDialogOpenId: number | null;
// 	setDeleteDialogOpenId: React.Dispatch<React.SetStateAction<number | null>>;
// }

// const ProductDeleteDialog = ({
// 	product,
// 	deleteDialogOpenId,
// 	setDeleteDialogOpenId,
// }: OrderDeleteDialogProps) => {
// 	return (
// 		<AlertDialog
// 			open={deleteDialogOpenId === product.id}
// 			onOpenChange={(open) => setDeleteDialogOpenId(open ? product.id : null)}
// 		>
// 			<AlertDialogContent>
// 				<AlertDialogHeader>
// 					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
// 					<AlertDialogDescription>
// 						This action cannot be undone. This product will no longer be
// 						accessible by you or others.
// 					</AlertDialogDescription>
// 				</AlertDialogHeader>
// 				<AlertDialogFooter>
// 					<AlertDialogCancel>Cancel</AlertDialogCancel>
// 					<Button variant="destructive">Delete</Button>
// 				</AlertDialogFooter>
// 			</AlertDialogContent>
// 		</AlertDialog>
// 	);
// };

export default RequestedOrder;
