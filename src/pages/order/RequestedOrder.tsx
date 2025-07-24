// Documentation: This is the main component for the Requested Orders page.
// It orchestrates the display of requested orders, including search, filtering,
// export functionality, column management, and detailed order viewing/editing.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet, FileText, Settings } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import ColumnManager from "@/components/ui/ColumnManager";
import { useOrders } from "@/hooks/use-order";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { createCSV, createExcelSheet } from "@/lib/utils";
// Documentation: Corrected import path for OrderTable to be a sibling component within src/pages/order.
import OrderTable from "./OrderTable";

const RequestedOrder = () => {
	// State to manage visible columns in the table
	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"orderId",
		"customerName",
		"email",
		"phone",
		"orderDetails",
		"totalAmount",
		"paymentMethod",
		"paymentStatus",
		"deliveryMethod",
		"deliveryDate",
		"status",
		"method",
		"agentName",
		"agentNumber",
		"orderDate",
		"action",
	]);

	// Array of all possible columns for the column manager
	const allColumns = [
		{ key: "orderId", label: "Order ID" },
		{ key: "customerName", label: "Customer Name" },
		{ key: "email", label: "Email" },
		{ key: "phone", label: "Phone" },
		{ key: "orderDetails", label: "Order Details" },
		{ key: "totalAmount", label: "Total Amount" },
		{ key: "paymentMethod", label: "Payment Method" },
		{ key: "paymentStatus", label: "Payment Status" },
		{ key: "deliveryMethod", label: "Delivery Method" },
		{ key: "deliveryDate", label: "Est. Delivery Date" },
		{ key: "status", label: "Order Status" },
		{ key: "method", label: "Order Mode" },
		{ key: "agentName", label: "Agent Name" },
		{ key: "agentNumber", label: "Agent Number" },
		{ key: "orderDate", label: "Order Date" },
		{ key: "action", label: "Action" },
	];

	const {
		orders,
		setSearchTerm,
		searchBy,
		setSearchBy,
		setFilteredBy,
		setLimit,
		error,
	} = useOrders();
	const [searchValue, setSearchValue] = useState<string>("");
	const { toast } = useToast();

	// Documentation: Sets the filter for requested orders. This effect runs only once on component mount
	// to prevent re-fetching and potential table flickering issues.
	useEffect(() => {
		setFilteredBy("requested");
	}, [setFilteredBy]);

	// Documentation: Displays a toast notification if there's an error fetching orders.
	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, [error, toast]);

	// Documentation: Implements a debounce mechanism for the search input to limit API calls.
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchValue); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchValue, setSearchTerm]);

	// Documentation: Handles exporting order data to Excel or CSV format.
	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = orders.map((order) => ({
			ID: order.orderId,
			"Customer Name": order.customerName,
			"Customer Email": order.customerEmail,
			"Customer Phone": order.customerPhone,
			"Order Items": order.orderItems
				.map(
					(item) =>
						`${item?.product?.name || item?.unlistedProduct?.name} (x${
							item.quantity
						} piece), ${item.size ? "(" + item.size + " sq. feet)" : ""}`
				)
				.join(", "),
			"Total Amount": order.orderTotalPrice,
			"Payment Method": order.paymentMethod,
			"Payment Status": order.paymentStatus,
			"Delivery Method": order.deliveryMethod,
			"Est. Delivery": order.deliveryDate,
			"Current Status": order.currentStatus,
			Source: order.method,
			// The staff filtering here is for export data, not directly for table display.
			"Agent Name":
				(order as any).staff?.filter(
					(staffItem: any) => staffItem.staffId === order.staffId
				)[0]?.name ?? "N/A",
			"Agent Number":
				(order as any).staff?.filter(
					(staffItem: any) => staffItem.staffId === order.staffId
				)[0]?.phone ?? "N/A",
			"Date Added": new Date(order.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "requested-orders");
		} else if (format === "csv") {
			createCSV(worksheetData, "requested-orders");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Header section with search and search-by filter */}
			<Header
				title="Requested Orders"
				description="All the requested orders of your store in one place!"
			>
				<div className="truncate flex items-start space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by ${searchBy.split("-").join(" ")}...`}
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Select onValueChange={(e) => setSearchBy(e as any)}>
					<SelectTrigger className="w-[160px]" defaultValue={searchBy}>
						<SelectValue placeholder="Search By" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="order-id">Order Id</SelectItem>
							<SelectItem value="customer-name">Customer Name</SelectItem>
							<SelectItem value="customer-phone">Customer Phone</SelectItem>
							<SelectItem value="customer-email">Customer Email</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Header>

			{/* Filter options and column manager */}
			{orders.length > 0 && (
				<div className="w-full flex items-center justify-between  gap-4">
					<div className="flex items-center justify-between gap-3">
						<Button variant="success" onClick={() => handleExport("excel")}>
							<FileSpreadsheet size={15} />
							Export Excel
						</Button>
						<Button variant="secondary" onClick={() => handleExport("csv")}>
							<FileText size={15} />
							Export CSV
						</Button>
						{/* Documentation: ColumnManager component allows users to select which columns are visible in the table. */}
						<ColumnManager
							allColumns={allColumns}
							visibleColumns={visibleColumns}
							setVisibleColumns={setVisibleColumns}
						/>
					</div>

					<div className="flex items-center justify-between gap-3">
						<Select
							onValueChange={(e) => {
								setLimit(Number(e) as number);
							}}
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Show items" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="90">90</SelectItem>
									<SelectItem value="120">120</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			{/* Orders table or "No order found" message */}
			{orders.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					{/* Documentation: The main order table is now encapsulated in the OrderTable component. */}
					<OrderTable orders={orders} visibleColumns={visibleColumns} />
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No order found</p>
				</div>
			)}
		</section>
	);
};

export default RequestedOrder;
