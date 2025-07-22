import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash, Eye, MoreHorizontal } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { CustomerProps, useCustomer } from "@/hooks/use-customer";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";

const Customer = () => {
	const { customers, setSearchTerm, searchBy, setSearchBy, error } =
		useCustomer();
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

	const [filteredBy, setFilteredBy] = useState<
		"all" | "verified" | "unverified"
	>("all");

	const filteredCustomers = customers.filter((customer) => {
		if (filteredBy === "all") return true;
		if (filteredBy === "verified") return customer.verified;
		return !customer.verified;
	});

	return (
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Customers"
				description="See all the real customers of your store."
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by customer ${searchBy}`}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				<Select onValueChange={(e) => setSearchBy(e as any)}>
					<SelectTrigger className="w-[150px]" defaultValue={searchBy}>
						<SelectValue placeholder="Search By" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="email">Email</SelectItem>
							<SelectItem value="phone">Phone</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Header>

			{/* customers table */}
			{customers.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="verified">Verified</Tabs.Tab>
							<Tabs.Tab value="unverified">Unverified</Tabs.Tab>
							{/* <Tabs.Tab value="deleted">Deleted At</Tabs.Tab> */}
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable customers={filteredCustomers} />
						</Tabs.Panel>

						{/* verified tab */}
						<Tabs.Panel value="verified">
							<RenderTable customers={filteredCustomers} />
						</Tabs.Panel>

						{/* unverified tab */}
						<Tabs.Panel value="unverified">
							<RenderTable customers={filteredCustomers} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">
						No customers found
					</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({ customers }: { customers: CustomerProps[] }) => {
	const { totalPages, page, setPage, loading } = useCustomer();
	return (
		<Table className="border-collapse px-0 w-full">
			<TableCaption className="py-4 border border-t border-neutral-200">
				Showing {customers.length} entries
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
					<TableHead className="pl-5">
						<Checkbox />
					</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Phone</TableHead>
					<TableHead>Verification</TableHead>
					<TableHead>Date of Registration</TableHead>
					<TableHead className="w-[60px] pr-5">Actions</TableHead>
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
					{customers.map((customer) => (
						<TableRow key={customer.customerId}>
							<TableCell className="pl-5">
								<Checkbox />
							</TableCell>
							<TableCell>{customer.name}</TableCell>
							<TableCell>{customer.email}</TableCell>
							<TableCell>{customer.phone}</TableCell>
							<TableCell>
								<Badge
									size="sm"
									variant={customer.verified ? "success" : "destructive"}
								>
									{customer.verified ? "verified" : "unverified"}
								</Badge>
							</TableCell>
							<TableCell>
								{new Date(customer.createdAt).toDateString()}
							</TableCell>

							<TableCell className="space-x-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<span className="sr-only">Actions</span>
											<MoreHorizontal />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem>
												<Eye />
												View
											</DropdownMenuItem>
											<DropdownMenuItem className="text-rose-500">
												<Trash />
												Delete
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			)}
		</Table>
	);
};

export default Customer;
