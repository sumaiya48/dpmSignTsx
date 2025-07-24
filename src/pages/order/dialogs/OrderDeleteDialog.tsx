// Documentation: OrderDeleteDialog component provides a confirmation dialog for deleting an order.
// It handles the deletion logic and displays loading and toast notifications.
import React from "react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogCancel, // Added AlertDialogCancel import
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, OrderProps } from "@/hooks/use-order";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/api";

interface OrderDeleteDialogProps {
	order: OrderProps;
	deleteDialogOpenId: number | null;
	setDeleteDialogOpenId: React.Dispatch<React.SetStateAction<number | null>>;
}

const OrderDeleteDialog = ({
	order,
	deleteDialogOpenId,
	setDeleteDialogOpenId,
}: OrderDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchOrder } = useOrders();

	// Documentation: Handles the asynchronous deletion of an order.
	// Displays success/error toasts and re-fetches orders on completion.
	const deleteOrder = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await orderService.deleteOrder(authToken, order.orderId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchOrder();
			return;
		} catch (err: any) {
			setLoading(false);
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		}
	};

	return (
		<AlertDialog
			open={deleteDialogOpenId === order.orderId}
			onOpenChange={(open) =>
				setDeleteDialogOpenId(open ? order.orderId : null)
			}
		>
			{loading && (
				<>
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ radius: "xs", blur: 1 }}
					/>
				</>
			)}

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This product will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteOrder}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default OrderDeleteDialog;
