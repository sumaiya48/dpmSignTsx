import { Search } from "lucide-react";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface NavSearchProps {
	searchValue: string;
	setSearchValue: (value: string) => void;
}

const NavSearch = ({ searchValue, setSearchValue }: NavSearchProps) => {
	const { isMobile, open, setOpen, openMobile, setOpenMobile } = useSidebar();
	const searchboxRef = useRef<HTMLInputElement>(null);

	return (
		<SidebarGroup>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						className="hover:bg-transparent"
						tooltip={"Search"}
						isActive={false}
					>
						<Search
							className={cn(
								"cursor-pointer",
								open && "absolute top-1/2 transform -translate-y-1/2 right-5"
							)}
							onClick={() => {
								if (!open) {
									setOpen(true);
								} else if (isMobile && !openMobile) {
									setOpenMobile(true);
								}
								searchboxRef.current?.focus();
							}}
						/>
						<Input
							ref={searchboxRef}
							id="search"
							className={cn(open ? "visible" : "hidden", "pr-12")}
							placeholder="Search"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
						/>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default NavSearch;
