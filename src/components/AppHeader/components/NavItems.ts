export interface NavItem {
	label: string;
	to: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", to: "/" },
	{ label: "Applications", to: "/applications" },
	{ label: "Advanced Search", to: "/advanced-search" },
	// { label: "Trends", to: "/trends" },
	{ label: "Settings", to: "/settings" },
];
