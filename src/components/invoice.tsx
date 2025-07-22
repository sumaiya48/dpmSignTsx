import { currencyCode } from "@/config";
import { OrderItemProps, OrderProps, useOrders } from "@/hooks/use-order";
import { Printer } from "lucide-react";
import { useCouriers } from "@/hooks/use-courier";
import { useNavigate, useParams } from "react-router-dom";
import { useStaff } from "@/hooks/use-staff";
import { useCoupons } from "@/hooks/use-coupon";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { handleReactToPdf } from "@/lib/utils";
import Preloader from "./preloader";

const Invoice = () => {
	const { orderId } = useParams();
	const navigate = useNavigate();
	const { staff } = useStaff();
	const { couriers } = useCouriers();
	const { checkCoupon } = useCoupons();
	const { orders } = useOrders();

	const [order, setOrder] = useState<OrderProps | null>(null);
	const [orderTotalCouponCheckedPrice, setOrderTotalCouponCheckedPrice] =
		useState<number | null>(null);
	const printRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const loadCouponCheckedPrice = async () => {
			const foundOrder =
				orders.find((o) => o.orderId === Number(orderId)) ?? null;
			setOrder(foundOrder);

			if (!foundOrder) return;

			if (foundOrder.couponId) {
				const couponAppliedPrice = await getCouponCheckedPrice(
					foundOrder.couponId,
					foundOrder.orderTotalPrice
				);

				setOrderTotalCouponCheckedPrice(couponAppliedPrice);
			} else {
				setOrderTotalCouponCheckedPrice(foundOrder.orderTotalPrice);
			}
		};

		loadCouponCheckedPrice();
	}, [orderId, orders, navigate, order, orderTotalCouponCheckedPrice]);

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

	const handlePrint = () => {
		if (!printRef.current) return;
		setTimeout(() => {
			window.print();
		}, 50); // Shorter and snappier
	};

	const handleDownload = () => {
		if (!order || !printRef.current) return;
		handleReactToPdf(printRef.current, `invoice-#${order.orderId}.pdf`);
	};

	return (
		<>
			{order && orderTotalCouponCheckedPrice ? (
				<div className="w-full h-full flex flex-col gap-10 pt-5">
					<div className="w-full flex items-center justify-center gap-4 mb-4 print:hidden">
						<Button
							onClick={handlePrint}
							variant="outline"
							className="flex items-center gap-2"
						>
							<Printer className="h-4 w-4" />
							Print Invoice
						</Button>

						<Button onClick={handleDownload}>Download Invoice</Button>
					</div>

					<div
						ref={printRef}
						className="w-[900px] h-auto min-h-screen mx-auto pt-1 print:break-after-avoid-page"
					>
						{/* Header */}
						<div
							id="printHeader"
							className="w-full flex items-center justify-between gap-2 px-3"
						>
							{/* Logo (commented out for now) */}
							<div className="flex items-start justify-start gap-4">
								<div className="flex items-center justify-center">
									<img
										src="https://i.ibb.co.com/LSJvy7C/icon.png"
										alt="icon"
										className="max-w-[70px]"
									></img>
								</div>
								<div className="flex flex-col items-start gap-1">
									<h1 className="text-3xl tracking-wider font-bold text-red">
										Dhaka Plastic & Metal
									</h1>
									<span className="text-sm">
										Your Trusted Business Partner for Branding Solutions.
									</span>
									<span className="text-sm">
										<a
											href="mailto:info@dpmsign.com"
											target="_blank"
											className="text-skyblue"
										>
											info@dpmsign.com
										</a>{" "}
										|{" "}
										<a
											href="www.dpmsign.com"
											target="_blank"
											className="text-skyblue"
										>
											www.dpmsign.com
										</a>
									</span>
								</div>
							</div>
							<div className="text-right">
								<h2 className="text-skyblue font-bold text-3xl">INVOICE</h2>
								{order && (
									<>
										<p className="text-skyblue font-medium">#{order.orderId}</p>
										<p className="text-sm mt-2">
											Order Date:{" "}
											{new Date(order.createdAt).toLocaleDateString("en-GB")}
										</p>
										<p className="text-sm">
											Delivery Date:{" "}
											{order.deliveryDate
												? new Date(order.deliveryDate).toLocaleDateString(
														"en-GB"
												  )
												: "N/A"}
										</p>
									</>
								)}
							</div>
						</div>

						<div id="printContent" className="h-max min-h-full">
							{/* Address Container */}
							<div className="w-full h-[180px] mb-4 flex font-medium">
								{/* Billing Address */}
								<div className="flex-1 pt-4 px-3 border border-dashed border-black border-r-0">
									<h3 className="text-base font-bold pb-1">
										Billing Information:
									</h3>
									{order && (
										<>
											<p className="text-sm">Name: {order.customerName}</p>
											<p className="text-sm">Email: {order.customerEmail}</p>
											<p className="text-sm">Phone: {order.customerPhone}</p>
											<p className="text-sm">Address: {order.billingAddress}</p>
										</>
									)}
								</div>

								{/* Shipping Address */}
								<div className="flex-1 pt-4 px-3 border border-dashed border-black">
									<h3 className="text-base font-bold pb-1">
										Shipping Information:
									</h3>
									{order && couriers && (
										<>
											<p className="text-sm">
												Shipping Method:{" "}
												{order.deliveryMethod === "courier"
													? "Courier"
													: "Shop Pickup"}
											</p>
											{order.courierAddress && order.courierId && (
												<>
													<p className="text-sm">
														Preferred Courier:{" "}
														{couriers.find(
															(courier) => courier.courierId === order.courierId
														)?.name ?? "N/A"}
													</p>
													<p className="text-sm">
														Courier Address:{" "}
														{order.courierAddress
															? order.courierAddress
															: "N/A"}
													</p>
												</>
											)}
										</>
									)}
								</div>
							</div>

							{/* Order Details */}
							<div className="w-full h-auto mb-4">
								<h3 className="text-base font-bold">Order Details</h3>
								<table className="w-full table-auto border-collapse mt-2 text-sm">
									<thead>
										<tr className="bg-skyblue text-white">
											<th className="border border-gray/50 p-2 bg-gray-100">
												Item
											</th>
											<th className="border border-gray/50 p-2 bg-gray-100">
												Product Details
											</th>
											<th className="border border-gray/50 p-2 bg-gray-100">
												Quantity
											</th>
											<th className="border border-gray/50 p-2 bg-gray-100">
												Size
											</th>
											<th className="border border-gray/50 p-2 bg-gray-100">
												Total
											</th>
										</tr>
									</thead>
									<tbody>
										{order &&
											order.orderItems.map(
												(orderItem: OrderItemProps, index: number) => (
													<tr key={orderItem.orderId}>
														<td className="border border-gray/50 p-2 text-center">
															{++index}
														</td>
														<td className="border border-gray/50 p-2 truncate flex flex-col">
															{orderItem?.product?.name}
															<span className="text-xs text-neutral-600">
																{orderItem?.productVariant?.variantDetails.map(
																	(detail: any) => (
																		<span
																			key={detail.productVariantDetailId}
																			className="mr-2"
																		>
																			{detail.variationItem.variation.name}:{" "}
																			{detail.variationItem.value}{" "}
																			{detail.variationItem.variation.unit}
																			{orderItem.widthInch &&
																				orderItem.heightInch && (
																					<span className="text-xs text-neutral-600">
																						{orderItem.widthInch} inch x{" "}
																						{orderItem.heightInch} inch
																					</span>
																				)}
																		</span>
																	)
																)}{" "}
															</span>
														</td>
														<td className="border border-gray/50 p-2 text-center">
															{orderItem.quantity} (
															{orderItem.quantity > 1 ? "pieces" : "piece"})
														</td>
														<td className="border border-gray/50 p-2 text-center">
															{orderItem.size
																? orderItem.size.toLocaleString() + " sqfeet"
																: "N/A"}
														</td>
														<td className="border border-gray/50 p-2 text-center">
															{Number(orderItem.price).toLocaleString()}
															{" " + currencyCode}
														</td>
													</tr>
												)
											)}

										<tr>
											<td
												className="border-transparent p-2 align-middle"
												colSpan={2}
											></td>
											<td
												className="border border-gray/50 p-2 align-middle"
												colSpan={2}
											>
												<strong>Coupon Applied:</strong>
											</td>
											<td className="border border-gray/50 p-2 align-middle text-center">
												- {order.orderTotalPrice - orderTotalCouponCheckedPrice}{" "}
												{currencyCode}
											</td>
										</tr>
										<tr>
											<td
												className="border-transparent p-2 align-middle"
												colSpan={2}
											></td>
											<td
												className="border border-gray/50 p-2 align-middle"
												colSpan={2}
											>
												<strong>Total:</strong>
											</td>
											<td className="border border-gray/50 p-2 align-middle font-bold text-center">
												{Number(orderTotalCouponCheckedPrice).toLocaleString()}{" "}
												{currencyCode}
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							{/* Payment Details */}
							{order.payments.filter((payment) => payment.isPaid).length >
								0 && (
								<div className="w-full h-auto mb-5">
									<h3 className="text-base font-bold">Payment Details</h3>
									<table className="w-full border-collapse mt-2 text-sm">
										<thead>
											<tr className="bg-skyblue text-white">
												<th className="border border-gray/50 p-2 bg-gray-100">
													Payment Method
												</th>
												<th className="border border-gray/50 p-2 bg-gray-100 pr-8 text-end">
													Amount Paid
												</th>
											</tr>
										</thead>
										<tbody>
											{order.payments
												.filter((payment) => payment.isPaid)
												.map((payment) => (
													<tr key={payment.paymentId}>
														<td className="border border-gray/50 p-2 text-center">
															{payment.paymentMethod.split("-").join(" ")}
														</td>
														<td className="border border-gray/50 p-2 pr-8 text-end">
															{payment.amount.toLocaleString()} {currencyCode}
														</td>
													</tr>
												))}

											<tr>
												<td colSpan={1}></td>
												<td className="border border-gray/50 p-2 pr-8 font-bold text-end">
													<span>Amount Due: </span>
													<span className="text-rose-500">
														{(
															order.orderTotalPrice -
															order.payments
																.filter((payment) => payment.isPaid) // Only paid ones
																.reduce((acc, curr) => acc + curr.amount, 0)
														) // Sum their amounts
															.toLocaleString()}{" "}
														{currencyCode}
													</span>
												</td>
											</tr>
										</tbody>
									</table>
									<p className="mt-2 font-semibold text-xs italic">
										NB: Delivery charges are the customer’s responsibility (if
										applicable).
									</p>
								</div>
							)}

							{/* Footer Notes */}
							<div className="w-full h-auto min-h-min flex justify-between mt-20 text-center mb-5">
								<div>
									<p className="text-sm font-semibold">
										Thank you for choosing Dhaka Plastic & Metal!
									</p>
								</div>
								<div>
									<p className="text-sm">
										{staff.find(
											(staffItem) => staffItem.staffId === order.staffId
										)?.name ?? ""}
									</p>
									<p className="text-sm">
										{staff.find(
											(staffItem) => staffItem.staffId === order.staffId
										)?.phone ?? ""}
									</p>
									<p className="text-sm font-semibold">Authorized Signature</p>
									<p className="text-sm font-semibold">
										For Dhaka Plastic & Metal
									</p>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div id="printFooter" className="h-auto min-h-min w-full">
							<div className="bg-blue-900 text-white py-3 text-center">
								<p className="text-xs font-semibold">
									+88 01958253964, +88 01919960198 +88 01858253961
								</p>
								<p className="text-xs font-semibold">
									Shop No: 94 & 142 Dhaka University Market, Katabon Road,
									Dhaka-1000
								</p>
							</div>
						</div>
					</div>
				</div>
			) : (
				<Preloader />
			)}
		</>
	);
};

export default Invoice;
