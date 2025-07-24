// Documentation: OrderTable component is responsible for rendering the main table of orders.
// It dynamically displays columns based on the 'visibleColumns' prop and handles pagination.
// It also includes actions like viewing order details and deleting orders.
import React, { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash } from "lucide-react";
import { AppPagination } from "@/components/ui/app-pagination";
import { LoadingOverlay } from "@mantine/core";
import { currencyCode } from "@/config";
import { useOrders, OrderProps } from "@/hooks/use-order";
import { useStaff } from "@/hooks/use-staff";
import { useCoupons } from "@/hooks/use-coupon";
import { useAuth } from "@/hooks/use-auth";
// Documentation: Corrected import path for OrderViewDialog to be relative to src/pages/order/dialogs.
import OrderViewDialog from "./dialogs/OrderViewDialog";
// Documentation: Corrected import path for OrderDeleteDialog to be relative to src/pages/order/dialogs.
import OrderDeleteDialog from "./dialogs/OrderDeleteDialog";

interface OrderTableProps {
	orders: OrderProps[];
	visibleColumns: string[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, visibleColumns }) => {
	const { user } = useAuth();
	const { loading, totalPages, page, setPage } = useOrders();
	const { staff } = useStaff();
	const { checkCoupon } = useCoupons();
	const [orderViewDialogId, setOrderViewDialogId] = useState<number | null>(
		null
	);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);
	const [orderTotalCouponCheckedPrices, setOrderTotalCouponCheckedPrices] =
		useState<Record<number, number>>({});

	// Documentation: State to hold the currently selected order for viewing or deletion.
	const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);

	// Documentation: Fetches the discounted price if a coupon is applied to an order.
	// This function is memoized to avoid unnecessary re-calculations.
	const getCouponCheckedPrice = async (
		couponId: number,
		orderTotalPrice: number
	): Promise<number> => {
		try {
			const result = await checkCoupon(couponId, orderTotalPrice);
			return result.discountedPrice ?? orderTotalPrice;
		} catch (err: any) {
			console.error(err.message);
			return orderTotalPrice;
		}
	};

	// Documentation: Calculates and stores the coupon-applied prices for each order.
	// This effect runs whenever the 'orders' data or 'checkCoupon' function changes.
	useEffect(() => {
		orders.forEach(async (order) => {
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
				setOrderTotalCouponCheckedPrices((prev) => ({
					...prev,
					[order.orderId]: order.orderTotalPrice,
				}));
			}
		});
	}, [orders, checkCoupon]);

	// Documentation: Handles opening the OrderViewDialog for a specific order.
	const handleViewOrder = (order: OrderProps) => {
		setSelectedOrder(order);
		setOrderViewDialogId(order.orderId);
	};

	// Documentation: Handles opening the OrderDeleteDialog for a specific order.
	const handleDeleteOrder = (order: OrderProps) => {
		setSelectedOrder(order);
		setDeleteDialogOpenId(order.orderId);
	};

	return (
		<div className="w-full border border-neutral-200 rounded-lg overflow-x-auto">
			<Table className="border-collapse w-full">
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
						{/* Documentation: Dynamically renders table headers based on the 'visibleColumns' prop. */}
						{visibleColumns.includes("orderDate") && (
							<TableHead>Order Date</TableHead>
						)}
						{visibleColumns.includes("orderId") && (
							<TableHead>Order ID</TableHead>
						)}
						{visibleColumns.includes("customerName") && (
							<TableHead>Customer Name</TableHead>
						)}
						{visibleColumns.includes("phone") && <TableHead>Phone</TableHead>}
						{visibleColumns.includes("email") && <TableHead>Email</TableHead>}
						{visibleColumns.includes("orderDetails") && (
							<TableHead>Order Details</TableHead>
						)}
						{visibleColumns.includes("totalAmount") && (
							<TableHead>Total Amount</TableHead>
						)}
						{visibleColumns.includes("advancePayment") && (
							<TableHead>Advance Payment</TableHead>
						)}
						{visibleColumns.includes("due") && <TableHead>Due</TableHead>}
						{visibleColumns.includes("paymentMethod") && (
							<TableHead>Payment Method</TableHead>
						)}
						{visibleColumns.includes("paymentStatus") && (
							<TableHead>Payment Status</TableHead>
						)}
						{visibleColumns.includes("deliveryMethod") && (
							<TableHead>Delivery Method</TableHead>
						)}
						{visibleColumns.includes("billingAddress") && (
							<TableHead>Billing Address</TableHead>
						)}
						{visibleColumns.includes("courier") && (
							<TableHead>Courier</TableHead>
						)}
						{visibleColumns.includes("deliveryDate") && (
							<TableHead>Exp. Delivery Date</TableHead>
						)}
						{visibleColumns.includes("status") && (
							<TableHead>Order Status</TableHead>
						)}
						{visibleColumns.includes("method") && (
							<TableHead>Order Mode</TableHead>
						)}
						{visibleColumns.includes("agent") && <TableHead>Agent</TableHead>}
						{visibleColumns.includes("action") && <TableHead>Action</TableHead>}
					</TableRow>
				</TableHeader>
				{loading ? (
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				) : (
					<TableBody>
						{orders.map((order) => {
							const staffInfo = staff.find((s) => s.staffId === order.staffId);
							const advancePayment = order.payments?.[0]?.amount ?? 0;
							const totalAmount =
								orderTotalCouponCheckedPrices[order.orderId] ?? 0;
							const dueAmount = totalAmount - advancePayment;

							return (
								<TableRow key={order.orderId}>
									<TableCell className="pl-5">
										<Checkbox />
									</TableCell>
									{/* Documentation: Dynamically renders table cells based on the 'visibleColumns' prop. */}
									{visibleColumns.includes("orderDate") && (
										<TableCell>
											{new Date(order.createdAt).toDateString()}
										</TableCell>
									)}
									{visibleColumns.includes("orderId") && (
										<TableCell>#{order.orderId}</TableCell>
									)}
									{visibleColumns.includes("customerName") && (
										<TableCell>{order.customerName}</TableCell>
									)}
									{visibleColumns.includes("phone") && (
										<TableCell>{order.customerPhone}</TableCell>
									)}
									{visibleColumns.includes("email") && (
										<TableCell>{order.customerEmail}</TableCell>
									)}
									{visibleColumns.includes("orderDetails") && (
										<TableCell
											onClick={() => handleViewOrder(order)} // Changed to use handleViewOrder
											className="text-sm underline cursor-pointer"
										>
											View details
										</TableCell>
									)}
									{visibleColumns.includes("totalAmount") && (
										<TableCell>
											{totalAmount.toLocaleString()} {currencyCode}
										</TableCell>
									)}
									{visibleColumns.includes("advancePayment") && (
										<TableCell>
											{advancePayment.toLocaleString()} {currencyCode}
										</TableCell>
									)}
									{visibleColumns.includes("due") && (
										<TableCell>
											{dueAmount.toLocaleString()} {currencyCode}
										</TableCell>
									)}
									{visibleColumns.includes("paymentMethod") && (
										<TableCell>
											{order.paymentMethod === "cod-payment" ? "COD" : "Online"}
										</TableCell>
									)}
									{visibleColumns.includes("paymentStatus") && (
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
									)}
									{visibleColumns.includes("deliveryMethod") && (
										<TableCell>{order.deliveryMethod}</TableCell>
									)}
									{visibleColumns.includes("billingAddress") && (
										<TableCell title={order.billingAddress}>
											<div className="truncate max-w-[150px]">
												{order.billingAddress || "N/A"}
											</div>
										</TableCell>
									)}
									{visibleColumns.includes("courier") && (
										<TableCell>{order.courierId || "N/A"}</TableCell>
									)}
									{visibleColumns.includes("deliveryDate") && (
										<TableCell>
											{order.deliveryDate
												? new Date(order.deliveryDate).toDateString()
												: "N/A"}
										</TableCell>
									)}
									{visibleColumns.includes("status") && (
										<TableCell>
											<Badge size="sm" variant={order.status as any}>
												{order.status?.split("-").join(" ") || "N/A"}
											</Badge>
										</TableCell>
									)}
									{visibleColumns.includes("method") && (
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
									)}
									{visibleColumns.includes("agent") && (
										<TableCell>
											<div>{staffInfo?.name ?? "N/A"}</div>
											<div className="text-xs text-gray-500">
												{staffInfo?.phone ?? "N/A"}
											</div>
										</TableCell>
									)}
									{visibleColumns.includes("action") && (
										<TableCell>
											{/* Documentation: DropdownMenu for actions. */}
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													{/* Documentation: The "..." button for actions. */}
													<Button variant="ghost">
														<MoreHorizontal />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuItem
															onClick={() => handleViewOrder(order)} // Changed to use handleViewOrder
														>
															<Eye />
															View
														</DropdownMenuItem>
														{user?.role === "admin" && (
															<DropdownMenuItem
																className="text-rose-500"
																onClick={() => handleDeleteOrder(order)} // Changed to use handleDeleteOrder
															>
																<Trash />
																Delete
															</DropdownMenuItem>
														)}
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
				)}
			</Table>

			{/* Documentation: OrderViewDialog and OrderDeleteDialog are now rendered conditionally outside the map loop. */}
			{selectedOrder && orderViewDialogId === selectedOrder.orderId && (
				<OrderViewDialog
					order={selectedOrder}
					open={orderViewDialogId === selectedOrder.orderId}
					setOpen={setOrderViewDialogId}
				/>
			)}
			{selectedOrder && deleteDialogOpenId === selectedOrder.orderId && (
				<OrderDeleteDialog
					order={selectedOrder}
					deleteDialogOpenId={deleteDialogOpenId}
					setDeleteDialogOpenId={setDeleteDialogOpenId}
				/>
			)}
		</div>
	);
};

export default OrderTable;
