import { useAuth } from "@/hooks/use-auth";
import routes from "@/routes";
import {
	Users,
	Grid3X3,
	Images,
	Gift,
	Store,
	Ticket,
	Bot,
	Mails,
	BadgeHelp,
	Rss,
	Mailbox,
	Tag,
	ChartSpline,
	LucideIcon,
	Star,
	PackagePlusIcon,
	Package,
	Truck,
	CircleCheck,
	FilePlus,
	BriefcaseBusiness,
	ArrowRightLeft,
	Ban,
} from "lucide-react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useMemo,
	useCallback,
} from "react";
import { useLocation } from "react-router-dom";

// Define the shape of the context
interface NavSidebarContextType {
	setMenus: (menus: SidebarMenuType[]) => void;
	searchedMenus: SidebarMenuType[];
	searchValue: string;
	setSearchValue: (value: string) => void;
}

// Create the context with a default value
const NavSidebarContext = createContext<NavSidebarContextType | null>(null);

// Define the props for the provider
interface NavSidebarProviderProps {
	children: ReactNode;
}

export interface SidebarMenuType {
	title: string;
	url: string;
	icon: LucideIcon;
	isActive: boolean;
	roles?: Array<"admin" | "agent" | "designer">;
	items?: SidebarMenuType[];
}

// Provider component
export const NavSidebarProvider = ({ children }: NavSidebarProviderProps) => {
	const initialMenus = useMemo<SidebarMenuType[]>(
		() => [
			{
				title: "Dashboard",
				url: routes.dashboard.path,
				icon: ChartSpline,
				isActive: true,
				roles: ["admin", "agent", "designer"],
			},
			{
				title: "POS System",
				url: routes.pos.path,
				icon: Store,
				isActive: false,
				roles: ["admin", "agent", "designer"],
			},
			{
				title: "Order",
				url: routes.order.path,
				icon: Tag,
				isActive: false,
				roles: ["admin", "agent", "designer"],
				items: [
					{
						title: "Active Order",
						icon: Truck,
						url: routes.order.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
					{
						title: "New Request",
						icon: FilePlus,
						url: routes.order.requested.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
					{
						title: "Completed Order",
						icon: CircleCheck,
						url: routes.order.completed.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
					{
						title: "Cancelled Order",
						icon: Ban,
						url: routes.order.cancelled.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
				],
			},
			{
				title: "Products",
				icon: Gift,
				url: routes.product.path,
				isActive: false,
				items: [
					{
						title: "Product List",
						icon: Package,
						url: routes.product.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
					{
						title: "Add Product",
						icon: PackagePlusIcon,
						url: routes.product.add.path,
						isActive: false,
						roles: ["admin"],
					},
					{
						title: "Categories",
						url: routes.product.category.path,
						icon: Grid3X3,
						isActive: false,
						roles: ["admin"],
					},
					{
						title: "Product Review",
						icon: Star,
						url: routes.product.review.path,
						isActive: false,
						roles: ["admin", "agent", "designer"],
					},
				],
			},
			{
				title: "Coupons",
				url: routes.coupon.path,
				icon: Ticket,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Media",
				url: routes.media.path,
				icon: Images,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Customers",
				url: routes.customer.path,
				icon: Users,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Staff",
				url: routes.staff.path,
				icon: Bot,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Courier",
				url: routes.courier.path,
				icon: Truck,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Transactions",
				url: routes.transaction.path,
				icon: ArrowRightLeft,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Newsletter",
				url: routes.newsletter.path,
				icon: Mails,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Inqueries",
				url: routes.inquery.path,
				icon: Mailbox,
				isActive: false,
				roles: ["admin", "agent", "designer"],
			},
			{
				title: "FAQ",
				url: routes.faq.path,
				icon: BadgeHelp,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Blogs",
				url: routes.blog.path,
				icon: Rss,
				isActive: false,
				roles: ["admin"],
			},
			{
				title: "Jobs",
				url: routes.job.path,
				icon: BriefcaseBusiness,
				isActive: false,
				roles: ["admin"],
			},
			// {
			// 	title: "Store Settings",
			// 	url: "#",
			// 	icon: Settings,
			// 	isActive: false,
			// 	roles: ["admin"],
			// },
		],
		[]
	);

	const { user } = useAuth();
	const location = useLocation();

	const [menus, setMenus] = useState<SidebarMenuType[]>(initialMenus);
	const [searchValue, setSearchValue] = useState<string>("");

	// Filter menus based on user role
	const filteredMenus = useMemo(() => {
		return menus.filter((menu) => {
			if (menu.items) {
				const permitted = menu.items.filter((menuItem) =>
					menuItem.roles?.includes(user?.role as "admin" | "agent" | "designer")
				);

				if (permitted.length > 0) {
					menu.items = permitted;
					return menu;
				}
				return;
			} else {
				if (menu?.roles?.includes(user?.role as "admin" | "agent" | "designer"))
					return menu;
				return;
			}
		});
	}, [menus]);

	// Update isActive state based on the current location
	const updateIsActive = useCallback(
		(menus: SidebarMenuType[]): SidebarMenuType[] => {
			return menus.map((menu) => {
				if (menu.items) {
					return {
						...menu,
						items: menu.items.map((menuItem) => ({
							...menuItem,
							isActive: menuItem.url === location.pathname,
						})),
						isActive:
							menu.items.filter((menuItem) => menuItem.isActive).length > 0,
					};
				} else {
					return {
						...menu,
						isActive: menu.url === location.pathname,
					};
				}
			});
		},
		[location.pathname]
	);

	// Sort menus by search relevance
	const sortMenuBySearch = useCallback(
		(menus: SidebarMenuType[], query: string): SidebarMenuType[] => {
			if (!query) return menus;

			const queryLower = query.toLowerCase();

			// Function to filter and sort items recursively
			const filterAndSort = (items: SidebarMenuType[]): any => {
				return items
					.map((item) => {
						const titleLower = item.title.toLowerCase();
						let relevance = 0;

						if (titleLower === queryLower) {
							relevance = 3; // Exact match
						} else if (titleLower.startsWith(queryLower)) {
							relevance = 2; // Starts with query
						} else if (titleLower.includes(queryLower)) {
							relevance = 1; // Contains query
						}

						// Recursively filter nested items
						const filteredItems = item.items ? filterAndSort(item.items) : [];

						// If the parent has matching children, include it in the results
						const hasRelevantChildren = filteredItems.length > 0;
						if (hasRelevantChildren) {
							relevance = Math.max(relevance, 1); // Ensure parent is included
						}

						return relevance > 0 || hasRelevantChildren
							? { ...item, relevance, items: filteredItems }
							: null;
					})
					.filter(Boolean) // Remove non-matching items
					.sort((a, b) => (b as any).relevance - (a as any).relevance); // Sort by relevance
			};

			return filterAndSort(menus);
		},
		[]
	);

	// Update searched menus when searchValue changes
	const searchedMenus = useMemo(() => {
		return sortMenuBySearch(filteredMenus, searchValue);
	}, [filteredMenus, searchValue, sortMenuBySearch]);

	// Update menus when the location changes
	useEffect(() => {
		setMenus((prevMenus) => updateIsActive(prevMenus));
		setSearchValue(""); // Reset search value on location change
	}, [location.pathname, updateIsActive]);

	return (
		<NavSidebarContext.Provider
			value={{
				setMenus,
				searchedMenus,
				searchValue,
				setSearchValue,
			}}
		>
			{children}
		</NavSidebarContext.Provider>
	);
};

// Custom hook to use the context
export const useNavSidebar = () => {
	const context = useContext(NavSidebarContext);
	if (!context) {
		throw new Error("useNavSidebar must be used within a NavSidebarProvider");
	}
	return context;
};
