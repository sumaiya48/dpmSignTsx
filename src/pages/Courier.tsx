import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Search,
	Trash,
	CirclePlus,
	MoreHorizontal,
	Pen,
	Truck,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { LoadingOverlay } from "@mantine/core";
import Header from "@/components/header";
import { ChangeEvent, useEffect, useState } from "react";
import { useFormValidation } from "@/hooks/use-form-validation";
import { courierService } from "@/api";
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
import { useCouriers } from "@/hooks/use-courier";

const Courier = () => {
	const {
		couriers,
		setSearchTerm,
		loading,
		setLoading,
		fetchCouriers,
		totalPages,
		page,
		setPage,
		error,
	} = useCouriers();
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

	const [isAddCourierDialogOpen, setIsAddCourierDialogOpen] =
		useState<boolean>(false);

	const [courierEditDialogOpenId, setCourierEditDialogOpenId] = useState<
		number | null
	>(null);
	const [courierDeleteDialogOpenId, setCourierDeleteDialogOpenId] = useState<
		number | null
	>(null);

	const [courierName, setCourierName] = useState<string>("");

	const { errors, validateField } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;

		validateField("name", value, courierService.courierAddSchema);
		setCourierName(value);
	};

	const addCourier = async () => {
		try {
			if (validateField("name", courierName, courierService.courierAddSchema)) {
				setLoading(true);

				if (!authToken) return logout();

				const response = await courierService.addCourier(
					authToken,
					courierName
				);

				toast({
					description: response.message,
					variant: response.status === 201 ? "success" : "default",
					duration: 10000,
				});

				setCourierName("");
				setIsAddCourierDialogOpen(false);
				await fetchCouriers();
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
		<section className="w-full py-5 pl-2 pr-5 space-y-4 overflow-x-scroll min-w-max">
			{/* Heading */}
			<Header
				title="Courier"
				description="All courier service of your store in one place!"
			>
				<div className="truncate flex items-center space-x-2 relative">
					<Input
						className="pr-12"
						id="search"
						placeholder="Search courier"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Search
						size={20}
						className="cursor-pointer text-gray absolute top-1/2 transform -translate-y-1/2 right-5"
					/>
				</div>

				{/* Add courier dialog */}
				<Button onClick={() => setIsAddCourierDialogOpen(true)}>
					Add Courier <CirclePlus size={15} />
				</Button>

				{/* Add Courier Dialog */}
				<Dialog
					open={isAddCourierDialogOpen}
					onOpenChange={setIsAddCourierDialogOpen}
				>
					<DialogContent className="sm:max-w-[650px]">
						<DialogHeader>
							<DialogTitle>Add New Courier</DialogTitle>
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
								value={courierName}
								onChange={handleChange}
								error={errors.name ? true : false}
							/>
							{errors.name && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.name}
								</p>
							)}
						</div>

						<DialogFooter>
							<Button onClick={addCourier}>Add</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</Header>

			{/* courier table */}
			{couriers.length > 0 ? (
				<div className="w-full border border-neutral-200 rounded-lg">
					<Table className="border-collapse px-0 w-full">
						<TableCaption className="py-4 border border-t border-neutral-200">
							Showing {couriers.length} entries
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
								<TableHead className="w-max">Name</TableHead>
								<TableHead className="w-max">Created At</TableHead>
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
								{couriers.map((courier) => (
									<TableRow key={courier.courierId}>
										<TableCell className="pl-5">
											<Checkbox />
										</TableCell>
										<TableCell>{courier.courierId}</TableCell>
										<TableCell className="flex gap-2 items-center">
											<div className="h-10 w-10 rounded-full bg-skyblue/10 flex items-center justify-center">
												<Truck size={26} className="text-skyblue" />
											</div>
											<span className="font-medium">{courier.name}</span>
										</TableCell>
										<TableCell>
											{new Date(courier.createdAt).toDateString()}
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
																setCourierEditDialogOpenId(courier.courierId)
															}
														>
															<Pen />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-rose-500"
															onClick={() =>
																setCourierDeleteDialogOpenId(courier.courierId)
															}
														>
															<Trash />
															Delete
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
											{/* Edit Courier Dialog */}
											<CourierEditDialog
												courierId={courier.courierId}
												isOpen={courierEditDialogOpenId === courier.courierId}
												setIsOpen={(isOpen) =>
													setCourierEditDialogOpenId(
														isOpen ? courier.courierId : null
													)
												}
											/>
											{/* Delete Courier Dialog */}
											<CourierDeleteDialog
												courierId={courier.courierId}
												isOpen={courierDeleteDialogOpenId === courier.courierId}
												setIsOpen={(isOpen) =>
													setCourierDeleteDialogOpenId(
														isOpen ? courier.courierId : null
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						)}
					</Table>
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-neutral-500 mb-6 font-medium">No couriers found</p>
				</div>
			)}
		</section>
	);
};

interface CourierEditDialogProps {
	courierId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CourierEditDialog = ({
	courierId,
	isOpen,
	setIsOpen,
}: CourierEditDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { couriers, loading, setLoading, fetchCouriers } = useCouriers();
	const courier = couriers.find((courier) => courier.courierId === courierId);

	if (!courier) return;

	const [courierName, setCourierName] = useState<string>(courier.name);

	const { errors, validateField } = useFormValidation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;

		validateField("name", value, courierService.courierAddSchema);
		setCourierName(value);
	};

	const updateCourier = async () => {
		try {
			if (validateField("name", courierName, courierService.courierAddSchema)) {
				setLoading(true);

				if (!authToken) return logout();

				const response = await courierService.editCourier(
					authToken,
					courierId,
					courierName
				);

				toast({
					description: response.message,
					variant: response.status === 200 ? "success" : "default",
					duration: 10000,
				});

				setCourierName("");
				setIsOpen(false);

				await fetchCouriers();
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
					<DialogTitle>Edit Courier</DialogTitle>
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
						value={courierName}
						onChange={handleChange}
						error={errors.name ? true : false}
					/>
					{errors.name && (
						<p className="text-rose-500 font-medium text-xs">{errors.name}</p>
					)}
				</div>

				<DialogFooter>
					<Button onClick={updateCourier}>Update</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface CourierDeleteDialogProps {
	courierId: number;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CourierDeleteDialog = ({
	courierId,
	isOpen,
	setIsOpen,
}: CourierDeleteDialogProps) => {
	const { toast } = useToast();
	const { authToken, logout } = useAuth();
	const { loading, setLoading, fetchCouriers } = useCouriers();

	const deleteCourier = async () => {
		try {
			setLoading(true);

			if (!authToken) return logout();

			const response = await courierService.deleteCourier(authToken, courierId);

			toast({
				description: response.message,
				variant: response.status === 200 ? "success" : "default",
				duration: 10000,
			});

			await fetchCouriers();
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
						This action cannot be undone. This courier will no longer be
						accessible by you or others.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={deleteCourier}>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Courier;
