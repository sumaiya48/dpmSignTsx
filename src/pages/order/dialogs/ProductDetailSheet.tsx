// Documentation: ProductDetailSheet component displays detailed information about a specific product item within an order.
// It shows variation details, size, width, height, quantity, and price.
// import React from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { OrderItemProps } from "@/hooks/use-order"; // Assuming OrderItemProps is imported
import { currencyCode } from "@/config";

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
						{item?.unlistedProduct && (
							<div className="w-full pb-3">
								<p>{item?.unlistedProduct?.description}</p>
							</div>
						)}
						SKU:{" "}
						<span className="text-skyblue">{item?.product?.sku || "N/A"}</span>
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-6">
					<div className="space-y-2">
						<h3 className="font-medium">Variation Details</h3>
						{item?.productVariant &&
							item?.productVariant?.variantDetails.map((detail) => (
								<div
									key={detail.productVariantDetailId}
									className="flex justify-between text-sm"
								>
									<span className="text-gray-500">
										{detail.variationItem?.variation?.name}
									</span>
									<span>
										{detail.variationItem.value}{" "}
										{detail.variationItem?.variation?.unit}
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

export default ProductDetailSheet;
