import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ExternalLink, Package } from "lucide-react";
import { LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	useOrders,
	OrderProps,
	OrderItemProps,
	OrderImageProps,
} from "@/hooks/use-order";
import { useToast } from "@/hooks/use-toast";
import { useStaff } from "@/hooks/use-staff";
import { useCoupons } from "@/hooks/use-coupon";
// import { useCouriers } from "@/hooks/use-courier";
import { useAuth } from "@/hooks/use-auth";
import { orderService } from "@/api";
import OrderDetailsDisplay from "../OrderDetailsDisplay";
import CustomerInfoDisplay from "../CustomerInfoDisplay";
import OrderItemsDisplay from "../OrderItemsDisplay";
import EditableField from "@/components/ui/EditableField";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import PaymentSection from "../PaymentSection";

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
			</Carousel>
		</div>
	);
};

const OrderViewDialog = ({ order, open, setOpen }: OrderViewDialogProps) => {
	const { fetchOrder } = useOrders();
	const { toast } = useToast();
	const { staff } = useStaff();
	const { checkCoupon } = useCoupons();
	const { authToken } = useAuth();
	const [loading, setLoading] = useDisclosure();
	const [appliedCoupon, setAppliedCoupon] = useState<string>("N/A");
	const [orderTotalCouponCheckedPrice, setOrderTotalCouponCheckedPrice] =
		useState<number | null>(null);
	const [selectedItem, setSelectedItem] = useState<OrderItemProps | null>(null);

	if (!order) return null;

	const [orderDetailsFormData, setOrderDetailFormData] =
		useState<OrderDetailsFormProps>({
			status: order.status,
			deliveryDate: order.deliveryDate,
			courierAddress: order.courierAddress,
			additionalNotes: order.additionalNotes,
		});

	const [isEdited, setIsEdited] = useState(false);

	const handleStatusChange = (newStatus: string) => {
		setOrderDetailFormData((prev) => ({ ...prev, status: newStatus as any }));
		setIsEdited(true);
	};

	const handleDeliveryDateChange = (date: Date | undefined) => {
		if (date) {
			setOrderDetailFormData((prev) => ({ ...prev, deliveryDate: date }));
			setIsEdited(true);
		}
	};

	const handleAddressUpdate = (value: string) => {
		setOrderDetailFormData((prev) => ({ ...prev, courierAddress: value }));
		setIsEdited(true);
	};

	const handleNotesUpdate = (value: string) => {
		setOrderDetailFormData((prev) => ({ ...prev, additionalNotes: value }));
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
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	useEffect(() => {
		const getCouponCheckedPrice = async (
			couponId: number | null,
			totalPrice: number
		) => {
			setOrderTotalCouponCheckedPrice(totalPrice);
			if (!couponId) return;

			try {
				const result = await checkCoupon(couponId, totalPrice);
				setOrderTotalCouponCheckedPrice(result.discountedPrice ?? totalPrice);
				if (result.coupon) {
					setAppliedCoupon(result.coupon.code);
				}
			} catch (err: any) {
				console.log(err.message);
			}
		};

		getCouponCheckedPrice(order.couponId, order.orderTotalPrice);
	}, [order, checkCoupon]);
console.log(order)
	return (
		<Dialog
			open={open}
			onOpenChange={(open) => setOpen(open ? order.orderId : null)}
		>
			{loading && (
				<LoadingOverlay
					visible={loading}
					zIndex={10}
					overlayProps={{ radius: "xs", blur: 1 }}
					className="h-full min-h-[100vh] w-full"
				/>
			)}

			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
				<DialogHeader className="flex flex-row items-start justify-between mt-4 mb-2">
					<DialogTitle className="text-2xl font-bold">
						Order : DPM-{order.orderId}
					</DialogTitle>
					<div className="flex gap-3 items-start">
						<p className="font-bold">Agent:</p>
						<div className="flex flex-col gap-1 text-right">
							<p className="text-sm">
								{staff.find((s) => s.staffId === order.staffId)?.name ??
									"Unassigned"}
							</p>
							<p className="text-sm">
								{staff.find((s) => s.staffId === order.staffId)?.phone ?? "N/A"}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<OrderDetailsDisplay
							order={order}
							orderDetailsFormData={orderDetailsFormData}
							handleDeliveryDateChange={handleDeliveryDateChange}
							handleStatusChange={handleStatusChange}
						/>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
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

							<div className="flex items-center gap-2">
								<Package className="h-4 w-4" />
								<span>Payment Method:</span>
								<span className="font-medium text-black">
									{order.paymentMethod.replace(/-/g, " ")}
								</span>
							</div>

							<div className="flex items-center gap-2">
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
						/>
					</div>

					<Separator className="bg-neutral-500/30" />

					<CustomerInfoDisplay
						order={order}
						orderDetailsFormData={orderDetailsFormData}
						handleAddressUpdate={handleAddressUpdate}
					/>

					<Separator className="bg-neutral-500/30" />

					<OrderItemsDisplay
						order={order}
						orderTotalCouponCheckedPrice={orderTotalCouponCheckedPrice}
						selectedItem={selectedItem}
						setSelectedItem={setSelectedItem}
					/>

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

				{/* ✅ Footer is now inside DialogContent */}
				<DialogFooter className="flex justify-between mt-6">
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
			</DialogContent>
		</Dialog>
	);
};

export default OrderViewDialog;
