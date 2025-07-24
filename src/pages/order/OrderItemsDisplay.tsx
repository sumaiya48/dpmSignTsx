// Documentation: OrderItemsDisplay component renders a table of items included in an order.
// It shows product details, quantity, size, and price, and calculates total price with coupon application.
import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { OrderItemProps, OrderProps } from "@/hooks/use-order"; // Assuming OrderItemProps and OrderProps are imported
import { currencyCode } from "@/config";
// Documentation: Corrected import path for ProductDetailSheet to be relative to src/pages/order/dialogs.
import ProductDetailSheet from "./dialogs/ProductDetailSheet";

interface OrderItemsDisplayProps {
	order: OrderProps;
	orderTotalCouponCheckedPrice: number | null;
	selectedItem: OrderItemProps | null; // Using specific type
	setSelectedItem: React.Dispatch<React.SetStateAction<OrderItemProps | null>>;
}

const OrderItemsDisplay: React.FC<OrderItemsDisplayProps> = ({
	order,
	orderTotalCouponCheckedPrice,
	selectedItem,
	setSelectedItem,
}) => {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Order Items</h3>
			<Table>
				<TableBody>
					{order.orderItems.map((item: OrderItemProps) => (
						<TableRow
							key={item.orderItemId}
							className="cursor-pointer hover:bg-gray-50"
							onClick={() => setSelectedItem(item)}
						>
							<TableCell>
								<div className="flex items-center gap-4">
									<div>
										<p className="font-semibold truncate">
											{item?.product?.name?.slice(0, 40) ||
												item?.unlistedProduct?.name?.slice(0, 40)}
											{item?.product
												? item?.product?.name?.length > 40 && "..."
												: item?.unlistedProduct
												? item?.unlistedProduct?.name?.length > 40 && "..."
												: ""}{" "}
										</p>
										<div className="text-sm text-gray-500 mt-1">
											SKU:{" "}
											<span className="text-skyblue">
												{item?.product?.sku || "N/A"}{" "}
											</span>
											{item?.productVariant &&
												item?.productVariant.variantDetails.map(
													(detail: any) => (
														<span
															key={detail.productVariantDetailId}
															className="mr-2"
														>
															{detail.variationItem.variation.name}:{" "}
															{detail.variationItem.value}{" "}
															{detail.variationItem.variation.unit}{" "}
															{item.widthInch && item.heightInch && (
																<span className="text-xs text-neutral-600">
																	{item.widthInch} inch x {item.heightInch} inch
																</span>
															)}
														</span>
													)
												)}
										</div>
									</div>
								</div>
							</TableCell>
							<TableCell>
								Qty: {item.quantity} ({item.quantity > 1 ? "pieces)" : "piece)"}
							</TableCell>
							<TableCell>
								Size:{" "}
								{item.size ? `${item.size.toLocaleString()} sqfeet.` : "N/A"}
							</TableCell>
							<TableCell className="text-right">
								{Number(item.price).toLocaleString()}
								{" " + currencyCode}
							</TableCell>
						</TableRow>
					))}
					<TableRow>
						<TableCell className=""></TableCell>
						<TableCell className=""></TableCell>
						<TableCell>Coupon Applied: </TableCell>
						<TableCell className="text-right">
							-{" "}
							{orderTotalCouponCheckedPrice
								? (
										order.orderTotalPrice - orderTotalCouponCheckedPrice
								  ).toLocaleString()
								: "Calculating"}
							{" " + currencyCode}
						</TableCell>
					</TableRow>

					<TableRow>
						<TableCell className=""></TableCell>
						<TableCell className=""></TableCell>
						<TableCell>Total Price: </TableCell>
						<TableCell className="text-right">
							{orderTotalCouponCheckedPrice
								? orderTotalCouponCheckedPrice.toLocaleString()
								: "Calculating"}
							{" " + currencyCode}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>

			{/* Documentation: ProductDetailSheet is rendered conditionally when an item is selected. */}
			{selectedItem && (
				<ProductDetailSheet
					isOpen={!!selectedItem}
					onClose={() => setSelectedItem(null)}
					item={selectedItem}
				/>
			)}
		</div>
	);
};

export default OrderItemsDisplay;
