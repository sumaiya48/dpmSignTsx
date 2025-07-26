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
import { useStaff } from "@/hooks/use-staff"; // Make sure useStaff is imported
import { useCoupons } from "@/hooks/use-coupon";
import { useAuth } from "@/hooks/use-auth";
import OrderViewDialog from "./dialogs/OrderViewDialog";
import OrderDeleteDialog from "./dialogs/OrderDeleteDialog";

// Extend OrderProps to include the calculated commission amount
// This interface should ideally be defined where OrderProps is defined (e.g., use-order.tsx)
// but for immediate use here, we'll define it locally.
// If you already added commissionAmount to OrderProps in use-order.tsx, you can remove this local interface.
interface OrderWithCommissionProps extends OrderProps {
    commissionAmount?: number;
    agentCommissionPercentage?: number;
}

interface OrderTableProps {
	orders: OrderWithCommissionProps[]; // Use the extended interface
	visibleColumns: string[];
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, visibleColumns }) => {
	const { user } = useAuth();
	const { loading, totalPages, page, setPage } = useOrders();
	const { staff } = useStaff(); // Get staff data here
	const { checkCoupon } = useCoupons();
	const [orderViewDialogId, setOrderViewDialogId] = useState<number | null>(
		null
	);
	const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
		null
	);
	const [orderTotalCouponCheckedPrices, setOrderTotalCouponCheckedPrices] =
		useState<Record<number, number>>({});

	const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);

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

	useEffect(() => {
		// Only process if orders is available and not empty
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

			// Wait for all coupon price calculations to complete
			Promise.all(fetchPromises).then(() => {
				setOrderTotalCouponCheckedPrices(newPrices);
			});
		} else if (orders && orders.length === 0) {
            // If there are no orders, clear the prices
            setOrderTotalCouponCheckedPrices({});
        }
	}, [orders, checkCoupon]); // Re-run when orders or checkCoupon changes

	const handleViewOrder = (order: OrderProps) => {
		setSelectedOrder(order);
		setOrderViewDialogId(order.orderId);
	};

	const handleDeleteOrder = (order: OrderProps) => {
		setSelectedOrder(order);
		setDeleteDialogOpenId(order.orderId);
	};

	useEffect(() => {
		console.log("Current User Role in OrderTable:", user?.role);
		console.log("Orders received by OrderTable (count):", orders.length);
	}, [user, orders]);

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
						{/* NEW: Commission Table Head */}
						{visibleColumns.includes("commission") && <TableHead>Commission</TableHead>}
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

							// Calculate commission for the current order
                            const commissionRate = staffInfo?.commissionPercentage || 0;
                            // Use the totalAmount (which is coupon-checked price) for commission calculation
                            const commissionAmount = (totalAmount * commissionRate) / 100;

							return (
								<TableRow key={order.orderId}>
									<TableCell className="pl-5">
										<Checkbox />
									</TableCell>
									{visibleColumns.includes("orderDate") && (
										<TableCell>
											{new Date(order.createdAt).toDateString()}
										</TableCell>
									)}
									{visibleColumns.includes("orderId") && (
										<TableCell>
											DPM-{order.orderId}
										</TableCell>
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
											onClick={() => handleViewOrder(order)}
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
									{/* NEW: Commission Cell */}
									{visibleColumns.includes("commission") && (
                    <TableCell>
                        {(order.commissionAmount ?? 0).toLocaleString()} {currencyCode}
                        <div className="text-xs text-neutral-500">
                            ({(order.agentCommissionPercentage ?? 0)}%)
                        </div>
                    </TableCell>
                )}
									{visibleColumns.includes("action") && (
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
															onClick={() => handleViewOrder(order)}
														>
															<Eye />
															View
														</DropdownMenuItem>
														{user?.role === "admin" && (
															<DropdownMenuItem
																className="text-rose-500"
																onClick={() => handleDeleteOrder(order)}
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