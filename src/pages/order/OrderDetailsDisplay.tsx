// Documentation: OrderDetailsDisplay component shows the core details of an order,
// including order date, estimated delivery date (with editable option), and current status.
import React from "react";
import { Clock, CalendarIcon, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { differenceInHours, isValid } from "date-fns";
import { OrderProps } from "@/hooks/use-order"; // Assuming OrderProps is imported from hooks/use-order

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

interface OrderDetailsDisplayProps {
	order: OrderProps;
	orderDetailsFormData: OrderDetailsFormProps; // Using specific type
	handleDeliveryDateChange: (date: Date | undefined) => void;
	handleStatusChange: (newStatus: string) => void;
}

const OrderDetailsDisplay: React.FC<OrderDetailsDisplayProps> = ({
	order,
	orderDetailsFormData,
	handleDeliveryDateChange,
	handleStatusChange,
}) => {
	// Documentation: Determines the styling for the delivery date based on its proximity.
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

	// Documentation: Defines the possible order statuses for the status dropdown.
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

	return (
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
	);
};

export default OrderDetailsDisplay;
