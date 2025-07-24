// Documentation: PaymentSection component displays payment details and allows for adding cash or online payments.
// It handles payment history display, suggested initial payment, and functionality for adding new payments.
import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Imported Input for PaymentSection
import { Clipboard } from "lucide-react"; // Imported Clipboard for PaymentSection
import { LoadingOverlay } from "@mantine/core"; // Imported LoadingOverlay for PaymentSection
import { useDisclosure } from "@mantine/hooks"; // Imported useDisclosure for PaymentSection
import { useOrders, OrderProps } from "@/hooks/use-order"; // Imported OrderProps and useOrders for PaymentSection
import { useToast } from "@/hooks/use-toast"; // Imported useToast for PaymentSection
import { useAuth } from "@/hooks/use-auth"; // Imported useAuth for PaymentSection
import { orderService } from "@/api"; // Imported orderService for PaymentSection
import { useFormValidation } from "@/hooks/use-form-validation"; // Imported useFormValidation for PaymentSection
import { currencyCode } from "@/config"; // Imported currencyCode for PaymentSection

interface PaymentSectionProps {
	order: OrderProps;
	orderTotalCouponCheckedPrice: number | null;
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
												document.execCommand(
													"copy",
													false,
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
							(payment) => payment.isPaid || payment.paymentLink
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

export default PaymentSection;
