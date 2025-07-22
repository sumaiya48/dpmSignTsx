interface Route {
	name: string;
	path: string;
	title: string;
}

interface NestedRoute extends Route {
	[key: string]: any; // Allow additional nested routes
}

export interface Routes {
	[key: string]: NestedRoute; // Allow any key with a NestedRoute value
}

const routes: Routes = {
	dashboard: {
		path: "/",
		name: "Dashboard",
		title: "Dashboard - Control Panel | Dhaka Plastic & Metal",
	},
	product: {
		path: "/product",
		name: "Product",
		title: "Product - Control Panel | Dhaka Plastic & Metal",
		add: {
			path: "/product/add",
			name: "Add Product",
			title: "Add Product - Control Panel | Dhaka Plastic & Metal",
		},
		review: {
			path: "/product/review",
			name: "Product Reviews",
			title: "Product Reviews - Control Panel | Dhaka Plastic & Metal",
		},
		category: {
			path: "/product/category",
			name: "Category",
			title: "Category - Control Panel | Dhaka Plastic & Metal",
		},
	},
	order: {
		path: "/order",
		name: "Active Orders",
		title: "Active Orders - Control Panel | Dhaka Plastic & Metal",
		requested: {
			path: "/order/requested",
			name: "Requested Orders",
			title: "Requested Orders - Control Panel | Dhaka Plastic & Metal",
		},
		completed: {
			path: "/order/completed",
			name: "Completed Orders",
			title: "Completed Orders - Control Panel | Dhaka Plastic & Metal",
		},
		cancelled: {
			path: "/order/cancelled",
			name: "Cancelled Orders",
			title: "Cancelled Orders - Control Panel | Dhaka Plastic & Metal",
		},
	},
	coupon: {
		path: "/coupon",
		name: "Coupons",
		title: "Coupons - Control Panel | Dhaka Plastic & Metal",
	},
	customer: {
		path: "/customer",
		name: "Customers",
		title: "Customers - Control Panel | Dhaka Plastic & Metal",
	},
	staff: {
		path: "/staff",
		name: "Staff",
		title: "Staff - Control Panel | Dhaka Plastic & Metal",
	},
	inquery: {
		path: "/inquery",
		name: "Inqueries",
		title: "Inqueries - Control Panel | Dhaka Plastic & Metal",
	},
	pos: {
		path: "/pos-system",
		name: "POS",
		title: "POS - Control Panel | Dhaka Plastic & Metal",
	},
	media: {
		path: "/media",
		name: "Media",
		title: "Media - Control Panel | Dhaka Plastic & Metal",
	},
	newsletter: {
		path: "/newsletter",
		name: "Newsletter",
		title: "Newsletter - Control Panel | Dhaka Plastic & Metal",
	},
	auth: {
		path: "/auth",
		name: "Auth",
		title: "Control Panel | Dhaka Plastic & Metal",
	},
	faq: {
		path: "/faq",
		name: "Frequently Asked Questions",
		title: "Frequently Asked Questions - Control Panel | Dhaka Plastic & Metal",
	},
	blog: {
		path: "/blog",
		name: "Blogs",
		title: "Blogs - Control Panel | Dhaka Plastic & Metal",
	},
	courier: {
		path: "/courier",
		name: "Couriers",
		title: "Couriers - Control Panel | Dhaka Plastic & Metal",
	},
	job: {
		path: "/job",
		name: "Jobs",
		title: "Jobs - Control Panel | Dhaka Plastic & Metal",
	},
	transaction: {
		path: "/transaction",
		name: "Transactions",
		title: "Transactions - Control Panel | Dhaka Plastic & Metal",
	},
};

export default routes;
