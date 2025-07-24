// Documentation: CustomerInfoDisplay component presents the customer's contact information
// and addresses (billing, shipping, and courier if applicable). It includes an editable field for courier address.
import React from "react";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { OrderProps } from "@/hooks/use-order"; // Assuming OrderProps is imported from hooks/use-order
import { useCouriers } from "@/hooks/use-courier"; // Assuming useCouriers is imported from hooks/use-courier
// Documentation: EditableField is a generic UI component, so its path remains the same.
import EditableField from "@/components/ui/EditableField";

interface OrderDetailsFormProps {
	deliveryDate: Date | null;
	status: string; // Simplified for this component's needs
	courierAddress: string | null;
	additionalNotes: string;
}

interface CustomerInfoDisplayProps {
	order: OrderProps;
	orderDetailsFormData: OrderDetailsFormProps; // Using specific type
	handleAddressUpdate: (value: string) => void;
}

const CustomerInfoDisplay: React.FC<CustomerInfoDisplayProps> = ({
	order,
	orderDetailsFormData,
	handleAddressUpdate,
}) => {
	const { couriers } = useCouriers();

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Customer Information</h3>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2 ">
						<User className="h-4 w-4" />
						<span>Name:</span>
						<span className="font-medium text-black">{order.customerName}</span>
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
						<span className="text-neutral-600">{order.billingAddress}</span>
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
	);
};

export default CustomerInfoDisplay;
