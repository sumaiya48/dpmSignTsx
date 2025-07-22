import NavLogo from "@/components/nav-logo";
import NavSearch from "@/components/nav-search";
import NavMain from "@/components/nav-main";
import NavUser from "@/components/nav-user";
import { useNavSidebar } from "@/hooks/use-nav-sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";

const AppSidebar = ({ ...props }) => {
	const { searchedMenus, searchValue, setSearchValue } = useNavSidebar();
	const { logout, user } = useAuth();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<NavLogo />
			</SidebarHeader>
			<SidebarContent className="scrollbar-hidden scroll-smooth">
				<NavSearch searchValue={searchValue} setSearchValue={setSearchValue} />

				<NavMain menus={searchedMenus} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} logout={logout} />
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
