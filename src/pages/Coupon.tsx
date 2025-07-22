import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash, CirclePlus, MoreHorizontal, Pen } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingOverlay, Tabs } from "@mantine/core";
import Header from "@/components/header";
import { ChangeEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CouponProps, useCoupons } from "@/hooks/use-coupon";
import { useFormValidation } from "@/hooks/use-form-validation";
import { couponService } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppPagination } from "@/components/ui/app-pagination";
import { currencyCode } from "@/config";

interface CouponFormProps {
	name: string;
	code: string;
	discountType: "flat" | "percentage";
	amount: number;
	minimumAmount: number;
	endDate: Date;
}

const Coupon = () => {
	const {
		coupons,
		setSearchTerm,
		searchBy,
		setSearchBy,
		loading,
		setLoading,
		fetchCoupons,
		error,
	} = useCoupons();
	const [searchInput, setSearchInput] = useState<string>("");
	const { toast } = useToast();
	const { authToken, logout } = useAuth();

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
		"all" | "active" | "inactive" | "expired"
	>("all");

	const filteredCoupons = coupons.filter((coupon) => {
		if (filteredBy === "all") return true;
		if (filteredBy === "expired") return new Date(coupon.endDate) < new Date();
		if (filteredBy === "active") return coupon.isActive;
		return !coupon.isActive;
	});

	const [isAddCouponDialogOpen, setIsAddCouponDialogOpen] =
		useState<boolean>(false);

	const [couponCreationFormData, setCouponCreationFormData] =
		useState<CouponFormProps>({
			name: "",
			code: "",
			discountType: "flat",
			amount: 0,
			minimumAmount: 0,
			endDate: new Date(),
		});

	const { errors, validateField, validateForm } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		validateField(name, value, couponService.couponCreationSchema);
		setCouponCreationFormData({
			...couponCreationFormData,
			[name]: value,
		});
	};

	const addCoupon = async () => {
		try {
			if (
				validateForm(couponCreationFormData, couponService.couponCreationSchema)
			) {
				setLoading(true);

				if (!authToken) return logout();

				const response = await couponService.createCoupon(
					authToken,
					couponCreationFormData.name,
					couponCreationFormData.code,
					couponCreationFormData.discountType,
					couponCreationFormData.amount,
					couponCreationFormData.minimumAmount,
					couponCreationFormData.endDate
				);

				toast({
					description: response.message,
					variant: response.status === 201 ? "success" : "default",
					duration: 10000,
				});

				setCouponCreationFormData({
					name: "",
					code: "",
					discountType: "flat",
					amount: 0,
					minimumAmount: 0,
					endDate: new Date(),
				});
				setIsAddCouponDialogOpen(false);
				await fetchCoupons();

				return;
			}
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
		<section className="w-full py-5 px-2 space-y-4 overflow-x-hidden ">
			{/* Heading */}
			<Header
				title="Coupon"
				description="All Coupon of your store in one place!"
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder={`Search by coupon ${searchBy}`}
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
							<SelectItem value="code">Code</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				{/* Add category dialog */}
				<Button onClick={() => setIsAddCouponDialogOpen(true)}>
					Add Coupon <CirclePlus size={15} />
				</Button>

				{/* Add Coupon Dialog */}
				<Dialog
					open={isAddCouponDialogOpen}
					onOpenChange={setIsAddCouponDialogOpen}
				>
					<DialogContent className="sm:max-w-[650px]">
						<DialogHeader>
							<DialogTitle>Add New Coupon</DialogTitle>
						</DialogHeader>

						{loading && (
							<>
								<LoadingOverlay
									visible={loading}
									zIndex={10}
									overlayProps={{ radius: "xs", blur: 1 }}
								/>
							</>
						)}

						<div className="space-y-2">
							<Label htmlFor="name" className="cursor-pointer">
								Name
								<span className="text-skyblue"> *</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={couponCreationFormData.name}
								onChange={handleChange}
								error={errors.name ? true : false}
							/>
							{errors.name && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.name}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="code" className="cursor-pointer">
								Code
								<span className="text-skyblue"> *</span>
							</Label>
							<Input
								id="code"
								name="code"
								value={couponCreationFormData.code}
								onChange={handleChange}
								error={errors.code ? true : false}
							/>

							{errors.code && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.code}
								</p>
							)}
						</div>

						<div className="w-full flex items-baseline gap-4">
							<div className="space-y-2 my-4">
								<Label htmlFor="discountType" className="cursor-pointer">
									Select Discount Type
									<span className="text-skyblue"> *</span>
								</Label>

								<Select
									onValueChange={(v) => {
										setCouponCreationFormData((prevData) => ({
											...prevData,
											discountType: v as any,
										}));
									}}
								>
									<SelectTrigger
										error={errors.discountType ? true : false}
										id="discountType"
										className="w-[200px]"
									>
										<SelectValue placeholder="Discount Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="flat">Flat</SelectItem>
											<SelectItem value="percentage">Percentage</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount" className="cursor-pointer">
								Amount (
								{couponCreationFormData.discountType === "flat"
									? currencyCode
									: "%"}
								)<span className="text-skyblue"> *</span>
							</Label>
							<Input
								className="input-type-number"
								id="amount"
								name="amount"
								type="number"
								value={couponCreationFormData.amount}
								onChange={handleChange}
								error={errors.amount ? true : false}
							/>

							{errors.amount && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.amount}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="minimumAmount" className="cursor-pointer">
								Minimum Amount ({currencyCode})
								<span className="text-skyblue"> *</span>
							</Label>
							<Input
								className="input-type-number"
								id="minimumAmount"
								name="minimumAmount"
								type="number"
								value={couponCreationFormData.minimumAmount}
								onChange={handleChange}
								error={errors.minimumAmount ? true : false}
							/>
							{errors.minimumAmount && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.minimumAmount}
								</p>
							)}
						</div>

						<div className="space-x-5 space-y-2 py-1 grid grid-cols-2 gap-1 items-start justify-center">
							<div className="flex flex-col items-start w-full gap-3">
								<Label htmlFor="endDate" className="cursor-pointer">
									End Date
								</Label>
								<DatePicker
									id="endDate"
									selected={couponCreationFormData.endDate}
									onChange={(date: Date | null) => {
										if (!date) return;
										setCouponCreationFormData((prevFormData) => ({
											...prevFormData,
											endDate: date,
										}));
									}}
									placeholderText="Select end date"
									showTimeSelect
									dateFormat="dd/MM/yyyy h:mm aa"
									className={cn(
										"block w-full",
										"py-[1rem] pl-4 border-[0.1rem] border-solid border-neutral-300 hover:border-skyblue focus:border-skyblue text-black rounded-[0.4rem] transition-all duration-300 w-full outline-none flex h-9 bg-transparent text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 placeholder:text-sm lg:placeholder:text-sm "
									)}
									timeIntervals={15}
									timeCaption="Time"
									todayButton="Today"
								/>
							</div>

							{errors.endDate && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.endDate}
								</p>
							)}
						</div>

						<DialogFooter>
							<Button onClick={addCoupon}>Add</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</Header>

			{/* coupon table */}
			{coupons.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
						<Tabs.List className="h-14">
							<Tabs.Tab value="all">All</Tabs.Tab>
							<Tabs.Tab value="active">Active</Tabs.Tab>
							<Tabs.Tab value="inactive">Inactive</Tabs.Tab>
							<Tabs.Tab value="expired">Expired</Tabs.Tab>
						</Tabs.List>

						{/* all tab */}
						<Tabs.Panel value="all">
							<RenderTable filteredCoupons={filteredCoupons} />
						</Tabs.Panel>

						{/* active tab */}
						<Tabs.Panel value="active">
							<RenderTable filteredCoupons={filteredCoupons} />
						</Tabs.Panel>

						{/* inactive tab */}
						<Tabs.Panel value="inactive">
							<RenderTable filteredCoupons={filteredCoupons} />
						</Tabs.Panel>

						{/* expired tab */}
						<Tabs.Panel value="expired">
							<RenderTable filteredCoupons={filteredCoupons} />
						</Tabs.Panel>
					</Tabs>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No coupons found</p>
				</div>
			)}
		</section>
	);
};

const RenderTable = ({
	filteredCoupons,
}: {
	filteredCoupons: CouponProps[];
}) => {
	const { totalPages, page, setPage, loading } = useCoupons();
	const [openDeleteCouponDialogId, setOpenDeleteCouponDialogId] = useState<
		number | null
	>(null);
	const [openEditCouponDialogId, setOpenEditCouponDialogId] = useState<
		number | null
	>(null);

	return (
		<Table className="border-collapse px-0 w-full">
			<TableCaption className="py-4 border border-t border-neutral-200">
				Showing {filteredCoupons.length} entries
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
					<TableHead>Code</TableHead>
					<TableHead>Discount Type</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Minimum Amount ({currencyCode})</TableHead>
					<TableHead>End Date</TableHead>
					<TableHead>Date Added</TableHead>
					<TableHead>Status</TableHead>
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
					{filteredCoupons.map((coupon) => (
						<TableRow key={coupon.couponId}>
							<TableCell className="pl-5">
								<Checkbox />
							</TableCell>
							<TableCell>{coupon.name}</TableCell>
							<TableCell>
								<Badge size="sm">{coupon.code}</Badge>
							</TableCell>
							<TableCell>
								{coupon.discountType === "flat" ? "Flat" : "Percentage"}
							</TableCell>
							<TableCell>
								{coupon.amount} (
								{coupon.discountType === "flat" ? currencyCode : "%"})
							</TableCell>
							<TableCell>
								{coupon.minimumAmount} ({currencyCode})
							</TableCell>
							<TableCell>{new Date(coupon.endDate).toDateString()}</TableCell>
							<TableCell>{new Date(coupon.createdAt).toDateString()}</TableCell>
							<TableCell>
								<Badge
									size="sm"
									variant={coupon.isActive ? "success" : "destructive"}
								>
									{coupon.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell className="space-x-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost">
											<MoreHorizontal />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-56"
										side="bottom"
										align="end"
									>
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem
												onClick={() =>
													setOpenEditCouponDialogId(coupon.couponId)
												}
											>
												<Pen />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-rose-500"
												onClick={() =>
													setOpenDeleteCouponDialogId(coupon.couponId)
												}
											>
												<Trash />
												Delete
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
								{/* Edit Coupon Dialog */}
								<CouponEditDialog
									couponId={coupon.couponId}
									isOpen={openEditCouponDialogId === coupon.couponId}
									setIsOpen={(isOpen) =>
										setOpenEditCouponDialogId(isOpen ? coupon.couponId : null)
									}
								/>
								{/* Delete Coupon Dialog */}
								<CouponDeleteDialog
									couponId={coupon.couponId}
									isOpen={openDeleteCouponDialogId === coupon.couponId}
									setIsOpen={(isOpen) =>
										setOpenDeleteCouponDialogId(isOpen ? coupon.couponId : null)
									}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			)}
		</Table>
	);
};

interface CouponEditDialogProps {
	couponId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CouponEditDialog = ({
	couponId,
	isOpen,
	setIsOpen,
}: CouponEditDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { coupons, loading, setLoading, fetchCoupons } = useCoupons();
	const coupon = coupons.find((coupon) => coupon.couponId === couponId);

	if (!coupon) return;

	const [couponEditFormData, setCouponEditFormData] = useState<CouponFormProps>(
		{
			name: coupon.name || "",
			code: coupon.code || "",
			discountType: coupon.discountType || 0,
			amount: coupon.amount || 0,
			minimumAmount: coupon.minimumAmount || 0,
			endDate: new Date(coupon.endDate),
		}
	);

	const { errors, validateField, validateForm } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		validateField(name, value, couponService.couponCreationSchema);
		setCouponEditFormData({
			...couponEditFormData,
			[name]: value,
		});
	};

	const updateCoupon = async () => {
		try {
			if (
				validateForm(couponEditFormData, couponService.couponCreationSchema)
			) {
				setLoading(true);

				if (!authToken) return logout();

				const response = await couponService.editCoupon(
					authToken,
					couponId,
					couponEditFormData.name,
					couponEditFormData.discountType,
					couponEditFormData.amount,
					couponEditFormData.minimumAmount,
					couponEditFormData.endDate
				);

				toast({
					description: response.message,
					variant: response.status === 200 ? "success" : "default",
					duration: 10000,
				});

				setCouponEditFormData({
					name: "",
					code: "",
					discountType: "flat",
					amount: 0,
					minimumAmount: 0,
					endDate: new Date(),
				});
				setIsOpen(false);

				await fetchCoupons();
				return;
			}
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
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle>Edit Coupon</DialogTitle>
				</DialogHeader>

				{loading && (
					<>
						<LoadingOverlay
							visible={loading}
							zIndex={10}
							overlayProps={{ radius: "xs", blur: 1 }}
						/>
					</>
				)}

				<div className="space-y-2">
					<Label htmlFor="name" className="cursor-pointer">
						Name
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="name"
						name="name"
						value={couponEditFormData.name}
						onChange={handleChange}
						error={errors.name ? true : false}
					/>
					{errors.name && (
						<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="code" className="cursor-pointer">
						Code
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						id="code"
						name="code"
						value={couponEditFormData.code}
						readOnly={true}
					/>

					{errors.code && (
						<p className="text-rose-500 font-medium text-xs">{errors.code}</p>
					)}
				</div>

				<div className="w-full flex items-baseline gap-4">
					<div className="space-y-2 my-4">
						<Label htmlFor="discountType" className="cursor-pointer">
							Select Discount Type
							<span className="text-skyblue"> *</span>
						</Label>

						<Select
							value={couponEditFormData.discountType}
							onValueChange={(v) => {
								setCouponEditFormData((prevData) => ({
									...prevData,
									discountType: v as any,
								}));
							}}
						>
							<SelectTrigger
								error={errors.discountType ? true : false}
								id="discountType"
								className="w-[200px]"
							>
								<SelectValue placeholder="Discount Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="flat">Flat</SelectItem>
									<SelectItem value="percentage">Percentage</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amount" className="cursor-pointer">
						Amount (
						{couponEditFormData.discountType === "flat" ? currencyCode : "%"})
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						className="input-type-number"
						id="amount"
						name="amount"
						type="number"
						value={couponEditFormData.amount}
						onChange={handleChange}
						error={errors.amount ? true : false}
					/>

					{errors.amount && (
						<p className="text-rose-500 font-medium text-xs">{errors.amount}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="minimumAmount" className="cursor-pointer">
						Minimum Amount ({currencyCode})
						<span className="text-skyblue"> *</span>
					</Label>
					<Input
						className="input-type-number"
						id="minimumAmount"
						name="minimumAmount"
						type="number"
						value={couponEditFormData.minimumAmount}
						onChange={handleChange}
						error={errors.minimumAmount ? true : false}
					/>
					{errors.minimumAmount && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.minimumAmount}
						</p>
					)}
				</div>

				<div className="space-x-5 space-y-2 py-1 grid grid-cols-2 gap-1 items-start justify-center">
					<div className="flex flex-col items-start w-full gap-3">
						<Label htmlFor="endDate" className="cursor-pointer">
							End Date
						</Label>
						<DatePicker
							id="endDate"
							selected={couponEditFormData.endDate}
							onChange={(date: Date | null) => {
								if (!date) return;
								setCouponEditFormData((prevFormData) => ({
									...prevFormData,
									endDate: date,
								}));
							}}
							placeholderText="Select end date"
							showTimeSelect
							dateFormat="dd/MM/yyyy h:mm aa"
							className={cn(
								"block w-full",
								"py-[1rem] pl-4 border-[0.1rem] border-solid border-neutral-300 hover:border-skyblue focus:border-skyblue text-black rounded-[0.4rem] transition-all duration-300 w-full outline-none flex h-9 bg-transparent text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300 placeholder:text-sm lg:placeholder:text-sm "
							)}
							timeIntervals={15}
							timeCaption="Time"
							todayButton="Today"
						/>
					</div>

					{errors.endDate && (
						<p className="text-rose-500 font-medium text-xs">
							{errors.endDate}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button onClick={updateCoupon}>Update</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface CouponDeleteDialogProps {
	couponId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CouponDeleteDialog = ({
	couponId,
	isOpen,
	setIsOpen,
}: CouponDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchCoupons } = useCoupons();

	const deleteCoupon = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await couponService.deleteCoupon(authToken, couponId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchCoupons();
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
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
						This action cannot be undone. This coupon will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteCoupon}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Coupon;
