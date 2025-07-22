import { Input } from "@/components/ui/input";
import { FileSpreadsheet, FileText, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableCaption,
} from "@/components/ui/table";
import { LoadingOverlay } from "@mantine/core";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";
import { useTransactions } from "@/hooks/use-transaction";
import { currencyCode } from "@/config";
import { Button } from "@/components/ui/button";
import { createCSV, createExcelSheet } from "@/lib/utils";

const Transaction = () => {
	const {
		transactions,
		setSearchTerm,
		loading,
		totalPages,
		page,
		setPage,
		error,
	} = useTransactions();
	const [searchInput, setSearchInput] = useState<string>("");
	const { toast } = useToast();

	// Debounce search Effect
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput); // Only update context after delay
		}, 500); // Delay of 500ms

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchInput]);

	useEffect(() => {
		if (error) {
			toast({
				description: error,
				variant: "destructive",
				duration: 10000,
			});
		}
	}, []);

	const handleExport = (format: "excel" | "csv") => {
		const worksheetData = transactions.map((transaction) => ({
			ID: transaction.id,
			"Transaction ID": transaction.transactionId,
			"Order ID": transaction.orderId,
			"Value ID": transaction.valId,
			Amount: parseInt(transaction.amount).toLocaleString(),
			"Store Amount": parseInt(transaction.storeAmount).toLocaleString(),
			Card: transaction.cardType,
			"Bank Transaction ID": transaction.bankTransactionId,
			Status: transaction.status,
			Date: new Date(transaction.createdAt).toDateString(),
			Currency: transaction.currency,
			"Card Issuer": transaction.cardIssuer,
			"Card Brand": transaction.cardBrand,
			"Date Added": new Date(transaction.createdAt).toDateString(),
		}));

		if (format === "excel") {
			createExcelSheet(worksheetData, "transactions");
		} else if (format === "csv") {
			createCSV(worksheetData, "transactions");
		}
	};

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Transactions"
				description="All transactions of your store in one place!"
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search transaction by order id"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>
			</Header>

			{/* filter options */}
			{transactions.length > 0 && (
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
						{/* <Button variant="destructive">
							<Trash size={15} />
							Delete Selected
						</Button> */}
					</div>
				</div>
			)}

			{/* transaction table */}
			{transactions.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Table className="border-collapse px-0 w-full">
						<TableCaption className="py-4 border border-t border-neutral-200">
							Showing {transactions.length} entries
							<div className="w-full text-black">
								{totalPages > 1 && (
									<AppPagination
										page={page}
										totalPages={totalPages}
										onPageChange={setPage}
									/>
								)}
							</div>
						</TableCaption>
						<TableHeader>
							<TableRow className="bg-slate-100 hover:bg-slate-100">
								<TableHead className="w-12 pl-5">
									<Checkbox />
								</TableHead>
								<TableHead className="w-12">ID</TableHead>
								<TableHead className="w-max">Transaction ID</TableHead>
								<TableHead className="w-max">Order ID</TableHead>
								<TableHead className="w-max">Val ID</TableHead>
								<TableHead className="w-max">Amount</TableHead>
								<TableHead className="w-max">Store Amount</TableHead>
								<TableHead className="w-max">Card Type</TableHead>
								<TableHead className="w-max">Bank Transaction ID</TableHead>
								<TableHead className="w-max">Status</TableHead>
								<TableHead className="w-max">Transaction Date</TableHead>
								<TableHead className="w-max">Currency</TableHead>
								<TableHead className="w-max">Card Issuer</TableHead>
								<TableHead className="w-max">Card Brand</TableHead>
								<TableHead className="w-max pr-5">Created At</TableHead>
							</TableRow>
						</TableHeader>
						{loading ? (
							<>
								<LoadingOverlay
									visible={loading}
									zIndex={10}
									overlayProps={{ radius: "xs", blur: 1 }}
								/>
							</>
						) : (
							<TableBody>
								{transactions.map((transaction) => (
									<TableRow key={transaction.id}>
										<TableCell className="pl-5">
											<Checkbox />
										</TableCell>
										<TableCell>{transaction.id}</TableCell>
										<TableCell>{transaction.transactionId}</TableCell>
										<TableCell>{transaction.orderId}</TableCell>
										<TableCell>{transaction.valId}</TableCell>
										<TableCell>
											{parseInt(transaction.amount).toLocaleString()}{" "}
											{currencyCode}
										</TableCell>
										<TableCell>
											{parseInt(transaction.storeAmount).toLocaleString()}{" "}
											{currencyCode}
										</TableCell>
										<TableCell>{transaction.cardType}</TableCell>
										<TableCell>{transaction.bankTransactionId}</TableCell>
										<TableCell>{transaction.status}</TableCell>
										<TableCell>
											{new Date(transaction.transactionDate).toDateString()}
										</TableCell>
										<TableCell>{transaction.currency}</TableCell>
										<TableCell>{transaction.cardIssuer}</TableCell>
										<TableCell>{transaction.cardBrand}</TableCell>
										<TableCell className="pr-5">
											{new Date(transaction.createdAt).toDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						)}
					</Table>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">
						No transactions found
					</p>
				</div>
			)}
		</section>
	);
};

export default Transaction;
