import { currencyCode } from "@/config";
import { OrderItemProps, OrderProps, useOrders } from "@/hooks/use-order";
import { Printer } from "lucide-react";
import { useCouriers } from "@/hooks/use-courier";
import { useNavigate, useParams } from "react-router-dom";
import { useStaff } from "@/hooks/use-staff";
import { useCoupons } from "@/hooks/use-coupon";
import { useEffect, useRef, useState, useMemo } from "react"; // Added useMemo
import { Button } from "@/components/ui/button";
import { handleReactToPdf } from "@/lib/utils";
import Preloader from "./preloader"; // Assuming this is the correct path for Preloader

const Invoice = () => {
	const { orderId } = useParams();
	const navigate = useNavigate();
	const { staff } = useStaff();
	const { couriers } = useCouriers();
	const { checkCoupon } = useCoupons();
	const { orders } = useOrders(); // All orders available from context

	const [order, setOrder] = useState<OrderProps | null>(null);
	const [orderTotalCouponCheckedPrice, setOrderTotalCouponCheckedPrice] =
		useState<number | null>(null);
	const printRef = useRef<HTMLDivElement | null>(null);

	// Memoize the order data and its calculated values
	const invoiceData = useMemo(() => {
		if (!order || !staff || orderTotalCouponCheckedPrice === null) {
			return null;
		}

		const agentInfo = staff.find((s) => s.staffId === order.staffId);

		// Calculate subtotal (sum of all item prices before any discounts)
		const subTotal = order.orderItems.reduce((sum, item) => {
			// Use item.price which is the final price per unit for the item
			// and item.quantity
			return sum + (item.price * item.quantity);
		}, 0);

		// Calculate discount amount
		const discountAmount = subTotal - orderTotalCouponCheckedPrice;

		// Calculate paid amount
		const totalPaidAmount = order.payments
			.filter((payment) => payment.isPaid)
			.reduce((acc, curr) => acc + curr.amount, 0);

		// Calculate amount due
		const amountDue = orderTotalCouponCheckedPrice - totalPaidAmount;

		// Design Charge (assuming it comes from the designer if the staff is a designer)
		// Or a fixed value if no designer is assigned or specific design charge isn't tracked per order.
		// Based on the image, it looks like a fixed charge or a charge per order.
		// For now, let's use the designCharge from the assigned staff if they are a designer, else 0.
		const designCharge = agentInfo?.role === "designer" ? (agentInfo.designCharge || 0) : 0;

		// Installation Charge (hardcoded as per image, as no data source is provided)
		const installationCharge = 1148; // Hardcoded value from the image

		return {
			order,
			agentInfo,
			subTotal,
			discountAmount,
			designCharge,
			installationCharge,
			grandTotal: orderTotalCouponCheckedPrice, // This is the final total after coupon
			totalPaidAmount,
			amountDue,
		};
	}, [order, staff, orderTotalCouponCheckedPrice]);


	useEffect(() => {
		const loadOrderAndPrices = async () => {
			const foundOrder = orders.find((o) => o.orderId === Number(orderId));

			if (!foundOrder) {
				// If order not found, navigate back or show an error
				navigate('/orders'); // Redirect to orders page
				return;
			}
			setOrder(foundOrder);

			if (foundOrder.couponId) {
				const couponAppliedPrice = await checkCoupon(
					foundOrder.couponId,
					foundOrder.orderTotalPrice
				);
				setOrderTotalCouponCheckedPrice(couponAppliedPrice.discountedPrice ?? foundOrder.orderTotalPrice);
			} else {
				setOrderTotalCouponCheckedPrice(foundOrder.orderTotalPrice);
			}
		};

		if (orders.length > 0 && orderId) { // Ensure orders are loaded before trying to find
			loadOrderAndPrices();
		}
	}, [orderId, orders, navigate, checkCoupon]); // Added checkCoupon to dependencies

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

	if (!invoiceData) {
		return <Preloader />; // Show preloader while data is loading
	}

	const {
		order: currentOrder,
		agentInfo,
		subTotal,
		discountAmount,
		designCharge,
		installationCharge,
		grandTotal,
		// totalPaidAmount,
		amountDue,
	} = invoiceData;


	return (
		<>
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
					className="w-[900px] h-auto min-h-screen mx-auto pt-1 print:break-after-avoid-page bg-white p-6 font-sans text-black" // Added bg-white, p-6, font-sans
				>
					{/* Header */}
					<div
						id="printHeader"
						className="w-full flex items-center justify-between gap-2 px-3 pb-4 border-b-2 border-gray-300" // Added border-b
					>
						{/* Logo and Company Info */}
						<div className="flex items-start justify-start gap-4">
							<div className="flex items-center justify-center">
								<img
									src="https://i.ibb.co.com/LSJvy7C/icon.png" // Your logo URL
									alt="icon"
									className="max-w-[70px]"
								></img>
							</div>
							<div className="flex flex-col items-start gap-1">
								<h1 className="text-3xl tracking-wider font-bold text-red-600"> {/* Adjusted color */}
									Dhaka Plastic & Metal
								</h1>
								<span className="text-sm text-gray-700"> {/* Adjusted color */}
									Your Trusted Business Partner for Branding Solutions.
								</span>
								<span className="text-sm text-gray-700"> {/* Adjusted color */}
									<a
										href="mailto:info@dpmsign.com"
										target="_blank"
										className="text-blue-600 hover:underline" // Adjusted color and added hover
									>
										info@dpmsign.com
									</a>{" "}
									|{" "}
									<a
										href="https://www.dpmsign.com" // Corrected URL format
										target="_blank"
										className="text-blue-600 hover:underline" // Adjusted color and added hover
									>
										www.dpmsign.com
									</a>
								</span>
							</div>
						</div>
						{/* Invoice Details */}
						<div className="text-right flex flex-col items-end">
							<h2 className="text-[#3871C2]  text-3xl font-semibold ">INVOICE</h2> {/* Adjusted color */}
							<p className=" font-bold text-xl">DPM-{currentOrder.orderId}</p> {/* Adjusted color */}
							<p className="text-sm mt-2 text-gray-700"> {/* Adjusted color */}
								Order Date:{" "}
								{new Date(currentOrder.createdAt).toLocaleDateString("en-GB")}
							</p>
							<p className="text-sm text-gray-700"> {/* Adjusted color */}
								Delivery Date:{" "}
								{currentOrder.deliveryDate
									? new Date(currentOrder.deliveryDate).toLocaleDateString(
										"en-GB"
									)
									: "N/A"}
							</p>
						</div>
					</div>

					<div id="printContent" className="h-max min-h-full py-6"> {/* Added padding */}
						{/* Address Container */}
						<div className="w-full h-[180px] mb-6 flex font-medium "> {/* Added border */}
							{/* Billing Address */}
							<div className="flex-1 pt-4 px-4  "> {/* Added border-r, adjusted padding */}
								<h3 className="text-base font-bold pb-2 text-gray-800">
									Billing Information:
								</h3>
								{currentOrder && (
									<>
										<p className="text-sm text-gray-700">Name: {currentOrder.customerName}</p>
										<p className="text-sm text-gray-700">Email: {currentOrder.customerEmail || 'N/A'}</p>
										<p className="text-sm text-gray-700">Phone: {currentOrder.customerPhone}</p>
										<p className="text-sm text-gray-700">Address: {currentOrder.billingAddress}</p>
									</>
								)}
							</div>

							{/* Shipping Address */}
							<div className="flex-1 pt-4 px-4"> {/* Adjusted padding */}
								<h3 className="text-base font-bold pb-2 text-gray-800">
									Shipping Information:
								</h3>
								{currentOrder && couriers && (
									<>
										<p className="text-sm text-gray-700">
											Shipping Method:{" "}
											{currentOrder.deliveryMethod === "courier"
												? "Courier"
												: "Shop Pickup"}
										</p>
										{currentOrder.courierAddress && currentOrder.courierId && (
											<>
												<p className="text-sm text-gray-700">
													Preferred Courier:{" "}
													{couriers.find(
														(courier) => courier.courierId === currentOrder.courierId
													)?.name ?? "N/A"}
												</p>
												<p className="text-sm text-gray-700">
													Courier Address:{" "}
													{currentOrder.courierAddress
														? currentOrder.courierAddress
														: "N/A"}
												</p>
											</>
										)}
									</>
								)}
							</div>
						</div>

						{/* Order Details Table */}
						<div className="w-full h-auto mb-6"> {/* Adjusted margin */}
							<h3 className="text-base font-bold mb-2 text-gray-800 ">Order Details</h3>
							<table className="w-full table-auto border-collapse text-sm">
								<thead>
									<tr className="bg-[#3871C2] text-white"> {/* Blue header as per image */}
										<th className="border border-blue-700 p-2 text-center w-[5%]">NO</th>
										<th className="border border-blue-700 p-2 text-left w-[40%]">DESCRIPTION</th>
										<th className="border border-blue-700 p-2 text-center w-[15%]">QTY/SQ. FT.</th>
										<th className="border border-blue-700 p-2 text-center w-[20%]">PRICE</th>
										<th className="border border-blue-700 p-2 text-center w-[20%]">TOTAL</th>
									</tr>
								</thead>
								<tbody>
									{currentOrder &&
										currentOrder.orderItems.map(
											(orderItem: OrderItemProps, index: number) => (
												<tr key={orderItem.orderItemId} className={index % 2 === 0 ? "bg-white" : "bg-blue-100"}> {/* MODIFIED: Alternating row colors */}
													<td className="border border-gray-300 p-2 text-center">
														{index + 1}
													</td>
													<td className="border border-gray-300 p-2 whitespace-normal break-words">
														<span className="font-semibold">{orderItem?.product?.name || orderItem?.unlistedProduct?.name}</span>
														<br />
														<span className="text-xs text-gray-600 ">
															{orderItem?.productVariant?.variantDetails.map(
																(detail: any) => (
																	<span
																		key={detail.productVariantDetailId}
																		className="mr-2"
																	>
																		{detail.variationItem.variation.name}:{" "}
																		{detail.variationItem.value}{" "}
																		{detail.variationItem.variation.unit}
																	</span>
																)
															)}{" "}
															{orderItem.widthInch &&
																orderItem.heightInch && (
																	<span className="text-xs text-gray-600">
																		({orderItem.widthInch} inch x{" "}
																		{orderItem.heightInch} inch)
																	</span>
																)}
														</span>
													</td>
													<td className="border border-gray-300 p-2 text-center">
														{orderItem.quantity}{" "}
														{orderItem.quantity > 1 ? "pieces" : "piece"}
														{orderItem.size
															? ` (${orderItem.size.toLocaleString()} sq.ft)`
															: ""}
													</td>
													<td className="border border-gray-300 p-2 text-center">
														{Number(orderItem.price).toLocaleString()}
														{" " + currencyCode}
													</td>
													<td className="border border-gray-300 p-2 text-center">
														{(Number(orderItem.price) * orderItem.quantity).toLocaleString()}
														{" " + currencyCode}
													</td>
												</tr>
											)
										)}
								</tbody>
							</table>
						</div>

						{/* Summary Table */}
						<div className="w-full flex justify-end mb-6"> {/* Aligned to right */}
							<table className="w-1/3 table-auto border-collapse text-sm"> {/* Half width */}
								<tbody>
									<tr className="bg-gray-50">
										<td className=" px-2 text-right font-bold">Sub Total:</td>
										<td className=" px-2 text-right">
											{subTotal.toLocaleString()} {currencyCode}
										</td>
									</tr>
									<tr className="bg-white">
										<td className=" px-2 text-right font-bold">Design Charge:</td>
										<td className=" px-2 text-right">
											{designCharge.toLocaleString()} {currencyCode}
										</td>
									</tr>
									<tr className="bg-gray-50">
										<td className=" px-2 text-right font-bold">Installation Charge:</td>
										<td className=" px-2 text-right">
											{installationCharge.toLocaleString()} {currencyCode}
										</td>
									</tr>
									<tr className="bg-white mb-2 ">
										<td className=" px-2 text-right font-bold">Discount:</td>
										<td className="px-2 text-right">
											{discountAmount.toLocaleString()} {currencyCode}
										</td>
									</tr>
									<tr className="bg-[#3871C2] pt-2 text-white font-bold text-lg"> {/* Highlighted Grand Total */}
										<td className="border border-blue-700 px-2 text-right">GRAND TOTAL:</td>
										<td className="border border-blue-700 px-2 text-right">
											{grandTotal.toLocaleString()} {currencyCode}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						{/* Payment Details */}
						{currentOrder.payments.filter((payment) => payment.isPaid).length > 0 && (
							<div className="w-full h-auto mb-6"> {/* Adjusted margin */}
								<h3 className="text-base font-bold mb-2 text-gray-800">Payment Details</h3>
								<table className="w-full table-auto border-collapse text-sm">
									<thead>
										<tr className="bg-[#3871C2] text-white"> {/* Blue header */}
											<th className="border border-blue-700 p-2 text-left w-1/3">Payment Method</th>
											<th className="border border-blue-700 p-2 text-right w-1/3">Amount Paid</th>
											<th className="border border-blue-700 p-2 text-right w-1/3">Amount Due</th>
										</tr>
									</thead>
									<tbody>
										{currentOrder.payments
											.filter((payment) => payment.isPaid)
											.map((payment) => (
												<tr key={payment.paymentId} className="bg-gray-50">
													<td className="border border-gray-300 p-2 text-left">
														{payment.paymentMethod.split("-").join(" ")}
													</td>
													<td className="border border-gray-300 p-2 text-right">
														{payment.amount.toLocaleString()} {currencyCode}
													</td>
													<td className="border border-gray-300 p-2 text-right">
														{amountDue.toLocaleString()} {currencyCode}
													</td>
												</tr>
											))}
									</tbody>
								</table>
								<p className="mt-4 font-semibold text-xs italic text-gray-700">
									NB: Delivery charges are the customer’s responsibility (if
									applicable).
								</p>
							</div>
						)}

						{/* Footer Notes */}
						<div className="w-full h-auto min-h-min flex justify-between mt-16 text-center pb-4"> {/* Adjusted margin-top, added padding-bottom */}
							<div>
								<p className="text-sm font-semibold text-gray-800">
									Thank you for choosing Dhaka Plastic & Metal!
								</p>
							</div>
							<div className="flex flex-col items-end">
								<p className="text-sm font-semibold text-gray-800">
									{agentInfo?.name ?? ""}
								</p>
								<p className="text-sm text-gray-700">
									{agentInfo?.phone ?? ""}
								</p>
								<p className="text-sm font-semibold text-gray-800 border-t border-gray-500 mt-2 pt-1">
									Authorized Signature
								</p>
								<p className="text-sm font-semibold text-gray-800">
									For Dhaka Plastic & Metal
								</p>
							</div>
						</div>
					</div>

					{/* Footer Contact Info (bottom of the page) */}
					<div
						id="printFooter"
						className="bg-white text-xs text-black w-full py-3 px-4 border-t border-gray-300"
					>
						<div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
							{/* Phone Numbers */}
							<div className="flex items-center gap-1">
								 <svg
        className="w-6 h-6 text-blue-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 4.5l4.833 1.611a1.5 1.5 0 01.933 1.898l-.86 2.582a1.5 1.5 0 00.403 1.575l4.63 4.63a1.5 1.5 0 001.575.403l2.582-.86a1.5 1.5 0 011.898.933L19.5 21.75a1.5 1.5 0 01-1.5 1.5A17.25 17.25 0 013 6a1.5 1.5 0 011.5-1.5z"
        />
      </svg>
								<span>+8801919960198 <br /> +8801858253961</span>
							</div>

							{/* Email */}
							<div className="flex items-center gap-1">
								<svg
									className="w-6 h-6 text-blue-500"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 13.5l8-6V18H4V7.5l8 6zM12 12L4 6h16l-8 6z" />
								</svg>
								<span>info@dpmsign.com</span>
							</div>

							{/* Address */}
							<div className="flex items-center gap-1 text-center md:text-left flex-wrap">
								<svg
									className="w-6 h-6 text-blue-500"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
								</svg>
								<span>
									Shop No: 94 & 142, Dhaka University  <br /> Market,Katabon Road, Dhaka-1000
								</span>
							</div>
						</div>
					</div>

				</div>
			</div>
		</>
	);
};

export default Invoice;
