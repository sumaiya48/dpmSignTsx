import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Trash,
    Eye,
    MoreHorizontal,
    Plus,
    EyeClosed,
    Pen,
    CircleDollarSign,
} from "lucide-react";
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
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
import { Label } from "@/components/ui/label";
import { LoadingOverlay, Tabs } from "@mantine/core";
import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { useStaff } from "@/hooks/use-staff";
import { StaffProps, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AvatarImg from "@/assets/images/avatar.png";
import { useFormValidation } from "@/hooks/use-form-validation";
import { staffService } from "@/api";
import { cn } from "@/lib/utils";
import { AppPagination } from "@/components/ui/app-pagination";
import { currencyCode } from "@/config";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrders } from "@/hooks/use-order"; // Import useOrders

// Extend StaffProps to include calculated total commission
interface StaffWithCommissionProps extends StaffProps {
    totalCommissionEarned?: number;
}

const Staff = () => {
    const { staff, searchBy, setSearchTerm, setSearchBy, error, setShowDeleted, loading: loadingStaff } =
        useStaff();
    const { orders, fetchOrder, loading: loadingOrders } = useOrders(); // Fetch all orders
    const [searchInput, setSearchInput] = useState<string>("");
    const { toast } = useToast();
    setShowDeleted(true); // Always show deleted staff for management purposes? Confirm this logic.

    // Debounce search Effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput); // Only update context after delay
        }, 500); // Delay of 500ms

        return () => clearTimeout(handler); // Cleanup on each change
    }, [searchInput, setSearchTerm]);

    // Fetch all orders when component mounts or orders context changes
    useEffect(() => {
        // Ensure fetchOrder is called to get all orders for commission calculation
        fetchOrder();
    }, [fetchOrder]); // Dependency on fetchOrder to ensure it runs

    useEffect(() => {
        if (error) {
            toast({
                description: error,
                variant: "destructive",
                duration: 10000,
            });
        }
    }, [error, toast]);

    const [filteredBy, setFilteredBy] = useState<
        "all" | "agent" | "designer" | "deleted"
    >("all");

    // Memoize staff with calculated total commission
    const staffWithCalculatedCommission = useMemo(() => {
        if (!staff || !orders) return []; // Ensure both staff and orders data are available

        return staff.map((staffItem) => {
            // Filter orders made by this specific staff member
            const staffOrders = orders.filter(
                (order) => order.staffId === staffItem.staffId
            );

            // Calculate total commission for this staff member
            const totalCommission = staffOrders.reduce((sum, order) => {
                // Use the staffItem's current commissionPercentage
                // If you need historical commission rates, that must come from the backend with the order.
                const commission = (order.orderTotalPrice * staffItem.commissionPercentage) / 100;
                return sum + commission;
            }, 0);

            return {
                ...staffItem,
                totalCommissionEarned: totalCommission, // Add the calculated total commission
            };
        });
    }, [staff, orders]); // Recalculate when staff or orders data changes

    const filteredStaff = staffWithCalculatedCommission.filter((staffItem) => {
        if (filteredBy === "all") return !staffItem.isDeleted;
        if (filteredBy === "deleted") return staffItem.isDeleted;
        return staffItem.role === filteredBy && !staffItem.isDeleted;
    });

    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] =
        useState<boolean>(false);

    const isLoading = loadingStaff || loadingOrders; // Combined loading state

    return (
        <section className="w-full py-5 px-2 space-y-4 overflow-x-scroll">
            {/* Heading */}
            <Header title="Staff" description="See all the staff of your store.">
                <div className="truncate flex items-center space-x-2 relative">
                    <Input
                        className="pr-12"
                        id="search"
                        placeholder={`Search by staff ${searchBy}`}
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

                <Button onClick={() => setIsAddStaffDialogOpen(!isAddStaffDialogOpen)}>
                    <Plus size={15} />
                    Add Staff
                </Button>

                <AddStaffDialog
                    isAddStaffDialogOpen={isAddStaffDialogOpen}
                    setIsAddStaffDialogOpen={setIsAddStaffDialogOpen}
                />
            </Header>

            {/* staff table */}
            {isLoading ? ( // Use combined loading state
                <LoadingOverlay
                    visible={isLoading}
                    zIndex={10}
                    overlayProps={{ radius: "xs", blur: 1 }}
                />
            ) : filteredStaff.length > 0 ? (
                <div className="w-full border border-neutral-200 rounded-lg">
                    <Tabs defaultValue="all" onChange={(e) => setFilteredBy(e as any)}>
                        <Tabs.List className="h-14">
                            <Tabs.Tab value="all">All</Tabs.Tab>
                            <Tabs.Tab value="agent">Agent</Tabs.Tab>
                            <Tabs.Tab value="designer">Designer</Tabs.Tab>
                            <Tabs.Tab value="deleted">Deleted</Tabs.Tab>
                        </Tabs.List>

                        {/* all tab */}
                        <Tabs.Panel value="all">
                            <RenderTable staff={filteredStaff} />
                        </Tabs.Panel>

                        {/* agent tab */}
                        <Tabs.Panel value="agent">
                            <RenderTable staff={filteredStaff} />
                        </Tabs.Panel>

                        {/* designer tab */}
                        <Tabs.Panel value="designer">
                            <RenderTable staff={filteredStaff} />
                        </Tabs.Panel>

                        {/* deleted tab */}
                        <Tabs.Panel value="deleted">
                            <RenderTable staff={filteredStaff} />
                        </Tabs.Panel>
                    </Tabs>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-neutral-500 mb-6 font-medium">No staff found</p>
                </div>
            )}
        </section>
    );
};

const RenderTable = ({ staff }: { staff: StaffWithCommissionProps[] }) => { // Use StaffWithCommissionProps
    const { totalPages, page, setPage, loading: loadingStaffTable } = useStaff(); // Renamed loading to loadingStaffTable
    const { user } = useAuth(); // To check user role for actions

    const [editDialogOpenId, setEditDialogOpenId] = useState<number | null>(null);
    const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(
        null
    );
    const [clearBalanceDialogOpenId, setClearBalanceDialogOpenId] = useState<
        number | null
    >(null);

    return (
        <Table className="border-collapse px-0 w-full">
            <TableCaption className="py-4 border border-t border-neutral-200">
                Showing {staff.length} entries
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
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Commission Percentage</TableHead>
                    <TableHead>Design Charge ({currencyCode})</TableHead>
                    {/* <TableHead>Balance ({currencyCode})</TableHead> */}
                    <TableHead>Total Commission Earned ({currencyCode})</TableHead> {/* NEW COLUMN HEAD */}
                    <TableHead>Date of Registration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px] pr-5">Actions</TableHead>
                </TableRow>
            </TableHeader>
            {loadingStaffTable ? ( // Use loadingStaffTable
                <>
                    <LoadingOverlay
                        visible={loadingStaffTable}
                        zIndex={10}
                        overlayProps={{ radius: "xs", blur: 1 }}
                    />
                </>
            ) : (
                <TableBody>
                    {staff.map((staffItem) => (
                        <TableRow key={staffItem.staffId}>
                            <TableCell className="pl-5">
                                <Checkbox />
                            </TableCell>
                            <TableCell>
                                <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-sm">
                                    <img
                                        src={staffItem.avatarUrl ? staffItem.avatarUrl : AvatarImg}
                                        alt={staffItem.name}
                                        className="max-w-full object-cover object-center"
                                    />
                                </div>
                            </TableCell>
                            <TableCell>{staffItem.name}</TableCell>
                            <TableCell>{staffItem.email}</TableCell>
                            <TableCell>{staffItem.phone}</TableCell>
                            <TableCell>
                                <Badge
                                    size="sm"
                                    variant={staffItem.role === "agent" ? "default" : "secondary"}
                                >
                                    {staffItem.role}
                                </Badge>
                            </TableCell>
                            <TableCell>{staffItem.commissionPercentage}%</TableCell>
                            <TableCell>
                                {staffItem.designCharge
                                    ? `${staffItem.designCharge} ${currencyCode}`
                                    : "N/A"}
                            </TableCell>
                            {/* <TableCell>
                                {staffItem.balance} {currencyCode}
                            </TableCell> */}
                            <TableCell> {/* NEW COMMISSION EARNED CELL */}
                                {(staffItem.totalCommissionEarned ?? 0).toLocaleString()} {currencyCode}
                            </TableCell>
                            <TableCell>
                                {new Date(staffItem.createdAt).toDateString()}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    size="sm"
                                    variant={
                                        staffItem.status === "online" ? "success" : "destructive"
                                    }
                                    className="gap-1"
                                >
                                    <div
                                        className={cn(
                                            "rounded-full p-[3px]",
                                            staffItem.status === "online"
                                                ? "bg-green-500"
                                                : "bg-rose-500"
                                        )}
                                    ></div>
                                    {staffItem.status}
                                </Badge>
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
                                            <DropdownMenuItem
                                                onClick={() => setEditDialogOpenId(staffItem.staffId)}
                                            >
                                                <Pen />
                                                Edit
                                            </DropdownMenuItem>
                                            {staffItem.balance > 0 && user?.role === "admin" && ( // Only admin can clear balance
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setClearBalanceDialogOpenId(staffItem.staffId)
                                                    }
                                                >
                                                    <CircleDollarSign />
                                                    Clear Balance
                                                </DropdownMenuItem>
                                            )}
                                            {user?.role === "admin" && ( // Only admin can delete
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialogOpenId(staffItem.staffId)}
                                                    className="text-rose-500"
                                                >
                                                    <Trash />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <UpdateStaffDialog
                                    staffId={staffItem.staffId}
                                    isOpen={editDialogOpenId === staffItem.staffId}
                                    setIsOpen={(isOpen) =>
                                        setEditDialogOpenId(isOpen ? staffItem.staffId : null)
                                    }
                                />

                                {/* staff item clear balance dialog */}
                                <StaffClearBalanceDialog
                                    staffId={staffItem.staffId}
                                    staffName={staffItem.name}
                                    clearBalanceDialogOpenId={clearBalanceDialogOpenId}
                                    setClearBalanceDialogOpenId={setClearBalanceDialogOpenId}
                                />

                                {/* staff item delete dialog */}
                                <StaffDeleteDialog
                                    staffId={staffItem.staffId}
                                    deleteDialogOpenId={deleteDialogOpenId}
                                    setDeleteDialogOpenId={setDeleteDialogOpenId}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </Table>
    );
};

interface RegistrationFormProps {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    commissionPercentage: number;
    designCharge: number | undefined;
}

const AddStaffDialog = ({
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
}: {
    isAddStaffDialogOpen: boolean;
    setIsAddStaffDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { authToken, logout } = useAuth();
    const { loading, setLoading, fetchStaff } = useStaff();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [registrationFormData, setRegistrationFormData] =
        useState<RegistrationFormProps>({
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "",
            commissionPercentage: 1,
            designCharge: undefined,
        });
    const { errors, validateField, validateForm } = useFormValidation();

    const handleRegistrationFormData = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setRegistrationFormData({
            ...registrationFormData,
            [name]: value,
        });
        validateField(name, value, staffService.staffRegistrationSchema);
    };

    const handleRegistration = async () => {
        try {
            if (
                validateForm(registrationFormData, staffService.staffRegistrationSchema)
            ) {
                setLoading(true);
                if (!authToken) {
                    return logout();
                }
                await staffService.registerStaff(
                    authToken,
                    registrationFormData.name,
                    registrationFormData.email,
                    registrationFormData.phone,
                    registrationFormData.password,
                    registrationFormData.role,
                    registrationFormData.commissionPercentage,
                    registrationFormData.designCharge
                );

                toast({
                    description: "Successfully created a new staff",
                    variant: "success",
                    duration: 10000,
                });

                setRegistrationFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "",
                    commissionPercentage: 1,
                    designCharge: undefined,
                });

                setIsAddStaffDialogOpen(!isAddStaffDialogOpen);

                await fetchStaff();
                return;
            }
        } catch (err: any) {
            console.log(err.message);
            toast({
                description: err.message,
                variant: "destructive",
                duration: 10000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={isAddStaffDialogOpen}
            onOpenChange={(isOpen) => setIsAddStaffDialogOpen(isOpen)}
        >
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Staff</DialogTitle>
                    <DialogDescription>
                        Please fillup the form below to add a new staff. (*) marked fields
                        are required.
                    </DialogDescription>
                </DialogHeader>

                <LoadingOverlay
                    visible={loading}
                    zIndex={10}
                    overlayProps={{ blur: 2 }}
                />

                <div className="w-full flex items-center justify-center flex-col gap-4 py-4">
                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="name" className="cursor-pointer">
                            Name
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={registrationFormData.name}
                            onChange={handleRegistrationFormData}
                            error={errors.name ? true : false}
                        />

                        {errors.name && (
                            <p className="text-rose-500 font-medium text-xs">{errors.name}</p>
                        )}
                    </div>

                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="email" className="cursor-pointer">
                            Email
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={registrationFormData.email}
                            onChange={handleRegistrationFormData}
                            error={errors.email ? true : false}
                        />

                        {errors.email && (
                            <p className="text-rose-500 font-medium text-xs">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="phone" className="cursor-pointer">
                            Phone
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="text"
                            id="phone"
                            name="phone"
                            value={registrationFormData.phone}
                            onChange={handleRegistrationFormData}
                            error={errors.phone ? true : false}
                        />

                        {errors.phone && (
                            <p className="text-rose-500 font-medium text-xs">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="password" className="cursor-pointer">
                            Password
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <div className="flex w-full items-center space-x-2 relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={registrationFormData.password}
                                onChange={handleRegistrationFormData}
                                error={errors.password ? true : false}
                            />
                            {showPassword ? (
                                <EyeClosed
                                    size={20}
                                    className="cursor-pointer text-gray absolute right-5"
                                    onClick={() => setShowPassword(false)}
                                />
                            ) : (
                                <Eye
                                    size={20}
                                    className="cursor-pointer text-gray absolute right-5"
                                    onClick={() => setShowPassword(true)}
                                />
                            )}
                        </div>

                        {errors.password && (
                            <p className="text-rose-500 font-medium text-xs">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <Select
                            onValueChange={(value) => {
                                setRegistrationFormData({
                                    ...registrationFormData,
                                    role: value,
                                });
                                validateField(
                                    "role",
                                    value,
                                    staffService.staffRegistrationSchema
                                );
                            }}
                            name="role"
                        >
                            <SelectTrigger
                                error={errors.role ? true : false}
                                className="max-w-[200px]"
                            >
                                <SelectValue
                                    defaultValue={registrationFormData.role}
                                    placeholder="Role"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="designer">Designer</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <div className="w-full flex items-start flex-col gap-1">
                            <div className="w-full flex items-center justify-center gap-2">
                                <Label
                                    htmlFor="commissionPercentage"
                                    className="min-w-max cursor-pointer"
                                >
                                    Commission Percentage
                                    <span className="text-skyblue"> *</span>
                                </Label>
                                <Input
                                    id="commissionPercentage"
                                    type="number"
                                    name="commissionPercentage"
                                    className="input-type-number"
                                    min={1}
                                    max={20}
                                    value={registrationFormData.commissionPercentage}
                                    onChange={handleRegistrationFormData}
                                    error={errors.commissionPercentage ? true : false}
                                />
                            </div>

                            {errors.commissionPercentage && (
                                <p className="text-rose-500 font-medium text-xs">
                                    {errors.commissionPercentage}
                                </p>
                            )}
                        </div>

                        {registrationFormData.role === "designer" && (
                            <div className="w-full flex items-start flex-col gap-1">
                                <div className="w-full flex items-center justify-center gap-2">
                                    <Label
                                        htmlFor="designCharge"
                                        className="min-w-max cursor-pointer"
                                    >
                                        Design Charge
                                        <span className="text-skyblue"> *</span>
                                    </Label>
                                    <Input
                                        id="designCharge"
                                        type="number"
                                        name="designCharge"
                                        className="input-type-number"
                                        min={1}
                                        value={registrationFormData.designCharge || 1}
                                        onChange={handleRegistrationFormData}
                                        error={errors.designCharge ? true : false}
                                    />
                                </div>

                                {errors.designCharge && (
                                    <p className="text-rose-500 font-medium text-xs">
                                        {errors.designCharge}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleRegistration}>Add Staff</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface UpdateFormProps {
    name: string;
    email: string;
    phone: string;
    role: string;
    commissionPercentage: number;
    designCharge: number | undefined;
}

const UpdateStaffDialog = ({
    staffId,
    isOpen,
    setIsOpen,
}: {
    staffId: number;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { authToken, logout } = useAuth();
    const { staff } = useStaff();
    const { loading, setLoading, fetchStaff } = useStaff();
    const { toast } = useToast();
    const currentStaff = staff.find((staffItem) => staffItem.staffId === staffId);

    if (!currentStaff) {
        return;
    }

    const [updateFormData, setUpdateFormData] = useState<UpdateFormProps>({
        name: currentStaff.name,
        email: currentStaff.email,
        phone: currentStaff.phone,
        role: currentStaff.role,
        commissionPercentage: currentStaff.commissionPercentage,
        designCharge:
            currentStaff.role === "designer"
                ? currentStaff.designCharge || undefined
                : undefined,
    });
    const { errors, validateField, validateForm } = useFormValidation();

    const handleUpdateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateFormData({
            ...updateFormData,
            [name]: value,
        });
        validateField(name, value, staffService.staffUpdateSchema);
    };

    const handleUpdate = async () => {
        try {
            if (validateForm(updateFormData, staffService.staffUpdateSchema)) {
                setLoading(true);
                if (!authToken) {
                    return logout();
                }
                await staffService.updateStaff(
                    authToken,
                    updateFormData.name,
                    updateFormData.email,
                    updateFormData.phone,
                    updateFormData.role,
                    updateFormData.commissionPercentage,
                    updateFormData.designCharge
                );

                toast({
                    description: "Successfully updated staff information",
                    variant: "success",
                    duration: 10000,
                });

                setUpdateFormData({
                    name: "",
                    email: "",
                    phone: "",
                    role: "",
                    commissionPercentage: 1,
                    designCharge: undefined,
                });

                setIsOpen(false);

                await fetchStaff();
                return;
            }
        } catch (err: any) {
            console.log(err.message);
            toast({
                description: err.message,
                variant: "destructive",
                duration: 10000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Update Staff Information</DialogTitle>
                    <DialogDescription>
                        Please fillup the form below to add a new staff. (*) marked fields
                        are required.
                    </DialogDescription>
                </DialogHeader>

                <LoadingOverlay
                    visible={loading}
                    zIndex={10}
                    overlayProps={{ blur: 2 }}
                />

                <div className="w-full flex items-center justify-center flex-col gap-4 py-4">
                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="name" className="cursor-pointer">
                            Name
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={updateFormData.name}
                            onChange={handleUpdateFormData}
                            error={errors.name ? true : false}
                        />

                        {errors.name && (
                            <p className="text-rose-500 font-medium text-xs">{errors.name}</p>
                        )}
                    </div>

                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="email" className="cursor-pointer">
                            Email
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={updateFormData.email}
                            onChange={handleUpdateFormData}
                            error={errors.email ? true : false}
                        />

                        {errors.email && (
                            <p className="text-rose-500 font-medium text-xs">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex items-start justify-center flex-col gap-2">
                        <Label htmlFor="phone" className="cursor-pointer">
                            Phone
                            <span className="text-skyblue"> *</span>
                        </Label>
                        <Input
                            type="text"
                            id="phone"
                            name="phone"
                            value={updateFormData.phone}
                            onChange={handleUpdateFormData}
                            error={errors.phone ? true : false}
                        />

                        {errors.phone && (
                            <p className="text-rose-500 font-medium text-xs">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <Select
                            value={updateFormData.role}
                            onValueChange={(value) => {
                                setUpdateFormData({
                                    ...updateFormData,
                                    role: value,
                                });
                                validateField("role", value, staffService.staffUpdateSchema);
                            }}
                            name="role"
                        >
                            <SelectTrigger
                                error={errors.role ? true : false}
                                className="max-w-[200px]"
                            >
                                <SelectValue
                                    defaultValue={updateFormData.role}
                                    placeholder="Role"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="designer">Designer</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <div className="w-full flex items-start flex-col gap-1">
                            <div className="w-full flex items-center justify-center gap-2">
                                <Label
                                    htmlFor="commissionPercentage"
                                    className="min-w-max cursor-pointer"
                                >
                                    Commission Percentage
                                    <span className="text-skyblue"> *</span>
                                </Label>
                                <Input
                                    id="commissionPercentage"
                                    type="number"
                                    name="commissionPercentage"
                                    className="input-type-number"
                                    min={1}
                                    max={20}
                                    value={updateFormData.commissionPercentage}
                                    onChange={handleUpdateFormData}
                                    error={errors.commissionPercentage ? true : false}
                                />
                            </div>

                            {errors.commissionPercentage && (
                                <p className="text-rose-500 font-medium text-xs">
                                    {errors.commissionPercentage}
                                </p>
                            )}
                        </div>

                        {updateFormData.role === "designer" && (
                            <div className="w-full flex items-start flex-col gap-1">
                                <div className="w-full flex items-center justify-center gap-2">
                                    <Label
                                        htmlFor="designCharge"
                                        className="min-w-max cursor-pointer"
                                    >
                                        Design Charge
                                        <span className="text-skyblue"> *</span>
                                    </Label>
                                    <Input
                                        id="designCharge"
                                        type="number"
                                        name="designCharge"
                                        className="input-type-number"
                                        min={1}
                                        value={updateFormData.designCharge || 1}
                                        onChange={handleUpdateFormData}
                                        error={errors.designCharge ? true : false}
                                    />
                                </div>

                                {errors.designCharge && (
                                    <p className="text-rose-500 font-medium text-xs">
                                        {errors.designCharge}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdate}>Update Staff</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface StaffClearBalanceDialogProps {
    staffId: number;
    staffName: string;
    clearBalanceDialogOpenId: number | null;
    setClearBalanceDialogOpenId: React.Dispatch<
        React.SetStateAction<number | null>
    >;
}

const StaffClearBalanceDialog = ({
    staffId,
    staffName,
    clearBalanceDialogOpenId,
    setClearBalanceDialogOpenId,
}: StaffClearBalanceDialogProps) => {
    const { toast } = useToast();
    const { authToken, logout } = useAuth();
    const { loading, setLoading, fetchStaff } = useStaff();

    const clearBalance = async () => {
        try {
            setLoading(true);

            if (!authToken) return logout();

            const response = await staffService.clearBalance(authToken, staffId);

            toast({
                description: response.message,
                variant: response.status === 200 ? "success" : "default",
                duration: 10000,
            });

            await fetchStaff();
            setClearBalanceDialogOpenId(null);
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
            open={clearBalanceDialogOpenId === staffId}
            onOpenChange={(open) =>
                setClearBalanceDialogOpenId(open ? staffId : null)
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
                    <AlertDialogTitle>Clear Agent's Commission Balance</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to clear the commission balance for agent{" "}
                        <span className="font-semibold">{staffName}</span>. This action
                        cannot be undone, and the balance will be reset to zero. Please
                        confirm that the commission has been paid offline before proceeding.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={clearBalance}>
                        Confirm Balance Clear
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

interface StaffDeleteDialogProps {
    staffId: number;
    deleteDialogOpenId: number | null;
    setDeleteDialogOpenId: React.Dispatch<React.SetStateAction<number | null>>;
}

const StaffDeleteDialog = ({
    staffId,
    deleteDialogOpenId,
    setDeleteDialogOpenId,
}: StaffDeleteDialogProps) => {
    const { toast } = useToast();
    const { authToken, logout } = useAuth();
    const { loading, setLoading, fetchStaff } = useStaff();

    const deleteStaff = async () => {
        try {
            setLoading(true);

            if (!authToken) return logout();

            const response = await staffService.deleteStaff(authToken, staffId);

            toast({
                description: response.message,
                variant: response.status === 200 ? "success" : "default",
                duration: 10000,
            });

            await fetchStaff();
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
            open={deleteDialogOpenId === staffId}
            onOpenChange={(open) => setDeleteDialogOpenId(open ? staffId : null)}
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
                    <Button variant="destructive" onClick={deleteStaff}>
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default Staff;