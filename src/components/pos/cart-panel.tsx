import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	X,
	Tag,
	ShoppingCart,
	Trash2,
	Box,
	Ticket,
	User,
	Truck,
	Store,
	Receipt,
	Trash,
	Upload,
	CalendarIcon,
} from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { CartItemProps, useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn, formatPrice } from "@/lib/utils";
import ProductPlaceholderImg from "@/assets/images/product-placeholder.jpg";
import { currencyCode } from "@/config";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@mantine/core";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCouriers } from "@/hooks/use-courier";
import { useStaff } from "@/hooks/use-staff";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "../ui/label";
import { useFormValidation } from "@/hooks/use-form-validation";
import { orderService } from "@/api";
import { Calendar } from "../ui/calendar";

interface CheckoutFormProps {
	name: string;
	email: string;
	phone: string;
	staffId: number | null;
	billingAddress: string;
	additionalNotes: string;
	deliveryMethod: string;
	deliveryDate: Date | null;
	designFiles: File[] | [];
	courierId: number | null;
	courierAddress: string;
	couponId: number | null;
	// paymentMethod: string,
	amount: number;
	orderItems: CartItemProps[];
	// {
	// 	productId: number;
	// 	productVariantId?: number;
	// 	quantity: number;
	// 	size: number | null;
	// 	widthInch: number | null;
	// 	heightInch: number | null;
	// 	price: number;
	// }[];
}

const CartPanel = () => {
	const { toast } = useToast();
	const {
		cartItems,
		orderSummary,
		removeFromCart,
		clearCart,
		checkCoupon,
		removeCoupon,
		discount,
		setDiscount,
	} = useCart();
	const { user } = useAuth();
	const { couriers } = useCouriers();
	const { staff, setShowDeleted, loading } = useStaff();

	useEffect(() => {
		setShowDeleted(false);
	}, [staff, loading]);

	const [couponCode, setCouponCode] = useState("");
	const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
	const [discountType, setDiscountType] = useState<"cash" | "coupon">("cash");
	const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormProps>({
		name: "",
		email: "",
		phone: "",
		billingAddress: "",
		additionalNotes: "",
		designFiles: [],
		deliveryMethod: "",
		deliveryDate: null,
		courierId: null,
		courierAddress: "",
		// paymentMethod: "",
		amount: 0,
		staffId: null,
		couponId: null,
		orderItems: cartItems,
	});

	useEffect(() => {
		setCheckoutFormData((prevData) => ({
			...prevData,
			orderItems: cartItems,
		}));
	}, [cartItems]);

	const { errors, validateField, validateForm } = useFormValidation();

	const handleApplyCoupon = () => {
		if (couponCode.trim().length === 0) {
			toast({
				description: "Please enter a coupon code",
				variant: "destructive",
				duration: 10000,
			});
			return;
		}

		checkCoupon(couponCode);
	};

	const handleRemoveCoupon = () => {
		removeCoupon();
	};

	const handleCheckout = () => {
		if (cartItems.length === 0) {
			toast({
				description: "Your cart is empty",
				variant: "destructive",
				duration: 10000,
			});
			return;
		}

		setCheckoutDialogOpen(true);
	};

	const finalizeOrder = async () => {
		try {
			if (validateForm(checkoutFormData, orderService.orderCreationScema)) {
				const response = await orderService.createOrder(
					checkoutFormData.name,
					checkoutFormData.email,
					checkoutFormData.phone,
					checkoutFormData.staffId,
					checkoutFormData.billingAddress,
					checkoutFormData.additionalNotes,
					checkoutFormData.deliveryMethod,
					checkoutFormData.deliveryDate as Date,
					checkoutFormData.designFiles,
					checkoutFormData.courierId,
					checkoutFormData.courierAddress,
					checkoutFormData.couponId,
					checkoutFormData.amount,
					orderSummary.total,
					checkoutFormData.orderItems,
					
				);

				if (response.status === 201) {
					toast({
						description: response?.messae || "Order Placed Successfully",
						variant: "success",
						duration: 10000,
					});
					clearCart();
					setCheckoutDialogOpen(false);
					setCheckoutFormData({
						name: "",
						email: "",
						phone: "",
						billingAddress: "",
						additionalNotes: "",
						designFiles: [],
						deliveryMethod: "",
						deliveryDate: null,
						courierId: null,
						courierAddress: "",
						amount: 0,
						staffId: null,
						couponId: null,
						orderItems: cartItems,
					});
				}
			}
		} catch (err: any) {
			console.log(err);
			toast({
				description: err.message || "An unknown error occured.",
				variant: "destructive",
				duration: 10000,
			});
		}
	};

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		validateField(name, value, orderService.orderCreationScema);

		if (name === "amount") {
			if (Number(value) > orderSummary.total) {
				return;
			}
		}

		setCheckoutFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files).slice(
				0,
				Math.abs(checkoutFormData.designFiles.length - 5)
			);

			setCheckoutFormData({
				...checkoutFormData,
				designFiles: [...checkoutFormData.designFiles, ...files],
			});
		}
	};

	const handleDeliveryDateChange = (date: Date | undefined) => {
		if (date) {
			setCheckoutFormData((prevData) => ({
				...prevData,
				deliveryDate: date,
			}));
		}
	};

	return (
		<div className="w-full flex flex-col h-full">
			<div className="py-4  bg-white">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Cart
						{cartItems.length > 0 && (
							<Badge variant="secondary" className="ml-2 flex gap-2">
								<Box size={18} />
								{cartItems.length} {cartItems.length === 1 ? "item" : "items"}
							</Badge>
						)}
					</h2>
					{cartItems.length > 0 && (
						<Button
							variant="destructive"
							size="sm"
							onClick={clearCart}
							className="hover:text-destructive text-xs"
						>
							<Trash2 />
							Clear
						</Button>
					)}
				</div>
			</div>

			{cartItems.length === 0 ? (
				<div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
					<ShoppingCart className="h-12 w-12 mb-3" />
					<p>Your cart is empty</p>
					<p className="text-xs /70 mt-1">
						Add products from the catalog to create an order
					</p>
				</div>
			) : (
				<>
					<ScrollArea className="w-full flex-1">
						<ul className="w-full py-3 space-y-3">
							{cartItems.map((cartItem) => (
								<li
									key={cartItem.cartItemId}
									className="bg-slate-100/40 backdrop-blur-lg shadow-sm w-full flex gap-3 p-3 rounded-lg border border-gray/50 animate-fade-in shadow-subtle"
								>
									<div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
										<img
											src={
												cartItem.product.images[0]?.imageUrl ||
												ProductPlaceholderImg
											}
											alt={cartItem.product.name}
											className="w-full h-full object-cover"
										/>
									</div>

									<div className="w-full">
										<div className="w-full flex justify-between items-start gap-2">
											<div>
												<h4 className="font-medium text-sm truncate">
													{cartItem.product.name.slice(0, 40)}...
												</h4>
												{/* {item.matchedVariant && (
													<p className="text-xs ">
														Variant: {getVariationDetails(item)}
													</p>
												)} */}
											</div>

											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 hover:text-rose-500 hover:bg-rose-500/10 -mt-1 -mr-1"
												onClick={() => removeFromCart(cartItem.cartItemId)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>

										<div className="flex justify-between items-center mt-2">
											<div className="flex flex-col gap-2 text-sm text-gray">
												<div className="flex items-start gap-1">
													{cartItem?.productVariant &&
														cartItem?.productVariant.variantDetails
															.map((detail) => detail.variationItem.value)
															.join(", ")}
												</div>

												<div>
													{cartItem.quantity} (pieces)
													{cartItem.product.pricingType === "square-feet" && (
														<span className="text-sm text-gray">
															{" "}
															{cartItem.size} (sqFeet)
														</span>
													)}
												</div>
											</div>

											<div className="text-right text-sm font-medium">
												{formatPrice(cartItem.price)} {" " + currencyCode}
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</ScrollArea>

					<div className="border-t border-gray/50 bg-white p-4 space-y-4">
						<div className="w-full flex items-center justify-between">
							<h4 className="text-sm font-medium">
								{discountType === "cash"
									? "Cash Discount"
									: orderSummary.couponCode
									? "Applied Coupon"
									: "Add Coupon Code"}
							</h4>

							<ToggleGroup
								type="single"
								value={discountType}
								onValueChange={(value) =>
									value && setDiscountType(value as any)
								}
								className="border border-gray/50 rounded-md"
							>
								<ToggleGroupItem
									value="cash"
									aria-label="Toggle cash"
									className="px-3 text-sm"
								>
									<Ticket /> cash
								</ToggleGroupItem>
								<ToggleGroupItem
									value="coupon"
									aria-label="Toggle coupon"
									className="px-3 text-sm"
								>
									<Tag /> coupon
								</ToggleGroupItem>
							</ToggleGroup>
						</div>

						{discountType === "cash" ? (
							<div className="flex gap-2">
								<Input
									placeholder="Enter cash discount value"
									type="number"
									className="h-9 text-sm input-type-number"
									value={discount}
									onChange={(e) => {
										if (
											Number(e.target.value) >= 0 &&
											Number(e.target.value) <= orderSummary.subtotal
										) {
											setDiscount(Number(e.target.value));
										}
									}}
								/>
							</div>
						) : (
							<>
								{orderSummary.couponCode ? (
									<div className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
										<Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
											{orderSummary.couponCode}
										</Badge>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 text-xs  hover:text-destructive"
											onClick={handleRemoveCoupon}
										>
											Remove
										</Button>
									</div>
								) : (
									<div className="flex gap-2">
										<Input
											placeholder="Enter coupon code"
											className="h-9 text-sm"
											value={couponCode}
											onChange={(e) => setCouponCode(e.target.value)}
										/>
										<Button
											size="sm"
											variant="secondary"
											disabled={!couponCode.length}
											onClick={handleApplyCoupon}
										>
											Apply
										</Button>
									</div>
								)}
							</>
						)}

						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>
									{formatPrice(orderSummary.subtotal)}
									{" " + currencyCode}
								</span>
							</div>

							{orderSummary.discount > 0 && (
								<div className="flex justify-between text-green-600">
									<span>Discount</span>
									<span>
										-{formatPrice(orderSummary.discount)}
										{" " + currencyCode}
									</span>
								</div>
							)}

							<Separator className="my-2 bg-gray/50" />

							<div className="flex justify-between font-medium text-base">
								<span>Total</span>
								<span>
									{formatPrice(orderSummary.total)}
									{" " + currencyCode}
								</span>
							</div>
						</div>

						<Button className="w-full press-effect" onClick={handleCheckout}>
							Complete Order
						</Button>
					</div>
				</>
			)}

			<Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Confirm Order</DialogTitle>
						<DialogDescription>
							Please review your order details before confirming.
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="max-h-[70vh] pr-3">
						<div className="space-y-6 py-4">
							<div className="bg-secondary/30 p-4 rounded-lg space-y-3">
								<h4 className="font-medium">Order Summary</h4>

								<ul className="space-y-2 text-sm">
									{cartItems.map((item) => (
										<li key={item.cartItemId} className="flex justify-between">
											<div className="flex flex-wrap items-center gap-1">
												<span className="font-medium text-black">
													{item.product.name}
												</span>
												<span className="text-sm text-skyblue">
													×{item.quantity} (pieces)
												</span>
												{item.size && (
													<span className="text-sm text-skyblue">
														×{item.size.toFixed(2)} (sq.feet)
													</span>
												)}
											</div>

											<div className="text-xs text-gray flex flex-wrap gap-2">
												{item?.productVariant &&
													item?.productVariant.variantDetails.map(
														(detail, index) => (
															<p
																className="font-semibold text-gray"
																key={index}
															>
																{detail.variationItem.value}{" "}
															</p>
														)
													)}
											</div>
										</li>
									))}
								</ul>

								<Separator className="bg-gray/50" />

								<div className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>Subtotal</span>
										<span>
											{formatPrice(orderSummary.subtotal)} {currencyCode}
										</span>
									</div>

									{orderSummary.discount > 0 && (
										<div className="flex justify-between text-sm text-green-600">
											<span>Discount</span>
											<span>
												-{formatPrice(orderSummary.discount)} {currencyCode}
											</span>
										</div>
									)}

									<div className="flex justify-between font-medium pt-1 text-base">
										<span>Total</span>
										<span>
											{formatPrice(orderSummary.total)} {currencyCode}
										</span>
									</div>
								</div>
							</div>

							{/* Customer Information Form */}
							<div className="bg-white p-4 rounded-lg border border-gray/50">
								<h4 className="w-full font-medium mb-4 flex items-center gap-2">
									<User />
									Customer Information
								</h4>

								<div className="w-full py-4">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="flex items-center text-sm font-medium">
												Name <span className="text-skyblue ml-1">*</span>
											</label>
											<Input
												type="text"
												name="name"
												value={checkoutFormData.name}
												onChange={handleChange}
												error={errors.name ? true : false}
											/>
											{errors.name && (
												<p className="text-rose-500 font-semibold text-sm">
													{errors.name}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="flex items-center text-sm font-medium">
												Email Address
											</label>
											<Input
												type="email"
												name="email"
												value={checkoutFormData.email}
												onChange={handleChange}
												error={errors.email ? true : false}
											/>
											{errors.email && (
												<p className="text-rose-500 font-semibold text-sm">
													{errors.email}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="flex items-center text-sm font-medium">
												Phone <span className="text-skyblue ml-1">*</span>
											</label>
											<Input
												type="text"
												placeholder="01xxxxxxxxx"
												name="phone"
												value={checkoutFormData.phone}
												onChange={handleChange}
												error={errors.phone ? true : false}
											/>
											{errors.phone && (
												<p className="text-rose-500 font-semibold text-sm">
													{errors.phone}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="flex items-center text-sm font-medium">
												Billing Address{" "}
												<span className="text-skyblue ml-1">*</span>
											</label>
											<Textarea
												rows={5}
												resize="vertical"
												name="billingAddress"
												value={checkoutFormData.billingAddress}
												onChange={handleChange}
												error={errors.billingAddress ? true : false}
											></Textarea>
											{errors.billingAddress && (
												<p className="text-rose-500 font-semibold text-sm">
													{errors.billingAddress}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="flex items-center text-sm font-medium">
												Additional Notes
											</label>
											<Textarea
												rows={5}
												resize="vertical"
												name="additionalNotes"
												value={checkoutFormData.additionalNotes}
												onChange={handleChange}
												error={errors.additionalNotes ? true : false}
											></Textarea>
											{errors.additionalNotes && (
												<p className="text-rose-500 font-semibold text-sm">
													{errors.additionalNotes}
												</p>
											)}
										</div>

										<div className="form-group w-full flex flex-col gap-4 items-center justify-center">
											{checkoutFormData.designFiles.length < 5 && (
												<Label
													className="relative w-full h-40 border-dashed border-[3px] border-gray/30 hover:border-skyblue/80 transition-all duration-300 cursor-pointer rounded-lg flex items-start justify-center flex-col gap-1.5"
													htmlFor="designFile"
												>
													<Input
														id="designFile"
														type="file"
														multiple
														accept="image/*"
														className="w-full h-full pointer-events-none hidden"
														onChange={handleFileChange}
														name="designFile"
													/>
													<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 flex items-center justify-center flex-col gap-3">
														<Upload />
														<span className="text-sm cursor-pointer">
															Click to upload design file. Max 5 image.
														</span>
													</div>
												</Label>
											)}

											{checkoutFormData.designFiles && (
												<div className="w-full h-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
													{checkoutFormData.designFiles.map(
														(designFile, index) => (
															<div
																key={index}
																className="flex items-start justify-center flex-col gap-2 overflow-hidden"
															>
																<img
																	className="w-28 h-28 rounded-md"
																	src={URL.createObjectURL(designFile)}
																	alt="Not Found"
																/>

																<Button
																	size="sm"
																	variant="destructive"
																	onClick={() => {
																		setCheckoutFormData((prevFormData) => ({
																			...prevFormData,
																			designFiles:
																				prevFormData.designFiles.filter(
																					(_, itemIndex) => itemIndex != index
																				),
																		}));
																	}}
																>
																	<Trash />
																	Remove
																</Button>
															</div>
														)
													)}
												</div>
											)}
										</div>

										<div className="pt-2">
											<h4 className="font-medium text-base mb-2 text-gray-800">
												Delivery Options
											</h4>

											<div className="space-y-1.5">
												<div className="flex items-center space-x-2">
													<input
														type="radio"
														id="shop-pickup"
														name="deliveryMethod"
														value="shop-pickup"
														className="h-4 w-4"
														onChange={handleChange}
														checked={
															checkoutFormData.deliveryMethod === "shop-pickup"
														}
													/>
													<label
														htmlFor="shop-pickup"
														className="flex items-center text-sm gap-2 cursor-pointer"
													>
														<Store />
														Shop Pickup
													</label>
												</div>
												<div className="flex items-center space-x-2">
													<input
														type="radio"
														id="courier"
														name="deliveryMethod"
														value="courier"
														className="h-4 w-4"
														onChange={handleChange}
														checked={
															checkoutFormData.deliveryMethod === "courier"
														}
													/>
													<label
														htmlFor="courier"
														className="flex items-center text-sm gap-2 cursor-pointer"
													>
														<Truck />
														Courier Delivery
													</label>
												</div>
											</div>

											{checkoutFormData.deliveryMethod === "courier" && (
												<div className="mt-3 py-3 pl-6 border-l-2 border-gray/60">
													<div className="mb-3">
														<Select
															onValueChange={(courierId) =>
																setCheckoutFormData((prevFormData) => ({
																	...prevFormData,
																	courierId: Number(courierId),
																}))
															}
														>
															<SelectTrigger className="w-full">
																<SelectValue placeholder="Select a courier service" />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	{couriers?.length > 0 &&
																		couriers.map((courier, index) => (
																			<SelectItem
																				key={index}
																				value={courier.courierId.toString()}
																			>
																				{courier.name}
																			</SelectItem>
																		))}
																</SelectGroup>
															</SelectContent>
														</Select>
													</div>

													<div className="space-y-2">
														<label className="text-sm font-medium">
															Courier Address{" "}
															<span className="text-skyblue">*</span>
														</label>
														<Textarea
															placeholder="Courier address"
															rows={10}
															resize="vertical"
															name="courierAddress"
															value={checkoutFormData.courierAddress}
															onChange={handleChange}
															error={errors.courierAddress ? true : false}
														></Textarea>
														{errors.courierAddress && (
															<p className="text-rose-500 font-semibold text-sm">
																{errors.courierAddress}
															</p>
														)}
													</div>
												</div>
											)}

											<div className="mt-3 py-3 flex items-center gap-2 ">
												<CalendarIcon className="h-4 w-4" />
												<span>Est. Delivery:</span>

												<div className="flex gap-2 items-center">
													{!checkoutFormData.deliveryDate && (
														<span className="text-gray">N/A</span>
													)}

													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																// size="sm"
																className={cn(
																	checkoutFormData.deliveryDate &&
																		new Date(
																			checkoutFormData.deliveryDate
																		).toDateString(),
																	"font-normal"
																)}
															>
																{checkoutFormData.deliveryDate
																	? new Date(
																			checkoutFormData.deliveryDate
																	  ).toDateString()
																	: "Set Date"}
																<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start"
														>
															<Calendar
																mode="single"
																// selected={new Date(order?.deliveryDate)}
																onSelect={handleDeliveryDateChange}
																initialFocus
																disabled={(date) =>
																	date <
																	new Date(new Date().setHours(0, 0, 0, 0))
																}
																className={cn("p-3 pointer-events-auto")}
															/>
														</PopoverContent>
													</Popover>
												</div>
											</div>

											{user?.role === "admin" && (
												<div className="mt-4 space-y-2 py-4 border-t border-gray/50">
													<h4>
														Select a staff member or leave blank if you want to
														assign this order to a random staff.
													</h4>
													<Select>
														<SelectTrigger className="w-[220px]">
															<SelectValue placeholder="Select a staff member" />
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																{staff.map((staffItem, index) => (
																	<SelectItem
																		key={index}
																		value={staffItem.staffId.toString()}
																	>
																		{staffItem.name}
																	</SelectItem>
																))}
															</SelectGroup>
														</SelectContent>
													</Select>
												</div>
											)}

											<div className="mt-4 pt-4 border-t border-gray/50">
												<h4 className="w-full font-medium mb-4 flex items-center gap-2">
													<Receipt />
													Payment Information
												</h4>

												<div className="space-y-4">
													<div className="flex items-center justify-between">
														<h3 className="">Due Payment</h3>
														<span className="font-medium text-red">
															{formatPrice(
																orderSummary.total - checkoutFormData.amount
															)}{" "}
															{currencyCode}
														</span>
													</div>

													<div className="space-y-2">
														<label
															htmlFor="amount"
															className="flex items-center text-sm font-medium"
														>
															Cash Received{" "}
															<span className="text-skyblue ml-1">*</span>
														</label>
														<Input
															id="amount"
															type="number"
															name="amount"
															className="input-type-number"
															value={checkoutFormData.amount}
															onChange={handleChange}
															error={errors.amount ? true : false}
														/>
														{errors.amount && (
															<p className="text-rose-500 font-semibold text-sm">
																{errors.amount}
															</p>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</ScrollArea>

					<DialogFooter className="flex gap-3 sm:space-x-0">
						<Button
							variant="outline"
							onClick={() => setCheckoutDialogOpen(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button onClick={finalizeOrder} className="flex-1 press-effect">
							Confirm Order
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CartPanel;
