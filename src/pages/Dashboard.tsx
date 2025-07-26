import AvatarImg from "@/assets/images/avatar.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Activity,
	CircleCheckBig,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import Header from "@/components/header";

import { currencyCode } from "@/config";
import { StaffProps, useAuth } from "@/hooks/use-auth";
import { useCoupons } from "@/hooks/use-coupon";
import { useDashboard } from "@/hooks/use-dashboard";
import { cn, getGreeting } from "@/lib/utils";
import { LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import urljoin from "url-join";
import { apiStaticURL } from "@/lib/dotenv";

interface ChartConfig {
	[key: string]: {
		label: string;
		color: string;
	};
}

const Dashboard = () => {
	const { user } = useAuth();
	const { checkCoupon } = useCoupons();
	const { stats, loading: loadingStats } = useDashboard();
	const [orderTotalCouponCheckedPrices, setOrderTotalCouponCheckedPrices] =
		useState<Record<number, number>>({});

	const getCouponCheckedPrice = async (
		couponId: number,
		orderTotalPrice: number
	): Promise<number> => {
		try {
			// Maybe show loading spinner here manually if you want
			const result = await checkCoupon(couponId, orderTotalPrice);
			return result.discountedPrice ?? orderTotalPrice; // If no discount, fallback
		} catch (err: any) {
			console.error(err.message);
			return orderTotalPrice; // Fallback to original price on error
		}
	};

	useEffect(() => {
		stats.recentOrders.forEach(async (order) => {
			// Assuming each order might have a couponId and you want to call for all
			if (order.couponId) {
				const couponAppliedPrice = await getCouponCheckedPrice(
					order.couponId,
					order.orderTotalPrice
				);
				setOrderTotalCouponCheckedPrices((prev) => ({
					...prev,
					[order.orderId]: couponAppliedPrice,
				}));
			} else {
				// If no coupon, just use normal total
				setOrderTotalCouponCheckedPrices((prev) => ({
					...prev,
					[order.orderId]: order.orderTotalPrice,
				}));
			}
		});
	}, [stats]);

	const allMonths = loadingStats
		? []
		: [
				...new Set([
					...stats.earnings.map((e) => e.month),
					...stats.orders.map((o) => o.month),
					...stats.customers.map((c) => c.month),
				]),
		  ].sort();

	const chartConfig: ChartConfig = {
		earnings: {
			label: "Earnings",
			color: "hsl(var(--chart-1))",
		},
		orders: {
			label: "Orders",
			color: "hsl(var(--chart-2))",
		},
		customers: {
			label: "Customers",
			color: "hsl(var(--chart-3))",
		},
	};

	const chartData = allMonths.map((month) => ({
		month,
		earnings: stats.earnings.find((e) => e.month === month)?.total || 0,
		orders: stats.orders.find((o) => o.month === month)?.count || 0,
		customers: stats.customers.find((c) => c.month === month)?.count || 0,
	}));

	const statItems = [
		{
			title: "New Customers",
			value: stats.customers?.[stats.customers.length - 1]?.count || 0,
			icon: Users,
			colorScheme: { bg: "bg-blue-100", text: "text-blue-600" },
		},
		{
			title: "New Products",
			value: stats.products?.[stats.products.length - 1]?.count || 0,
			icon: Package,
			colorScheme: { bg: "bg-green-100", text: "text-green-600" },
		},
		{
			title: "Total Orders",
			value: stats.orders?.[stats.orders.length - 1]?.count || 0,
			icon: ShoppingCart,
			colorScheme: { bg: "bg-teal-100", text: "text-teal-600" },
		},
		{
  title: "Total Earnings",
  value: `${stats.recentOrders
    ?.reduce((total, order) => total + order.orderTotalPrice, 0)
    .toLocaleString()} ${currencyCode}`,
  icon: DollarSign,
  colorScheme: { bg: "bg-amber-100", text: "text-amber-600" },
}


	];

	return (
		<section className="w-full py-5 px-5 space-y-4 overflow-hidden max-w-full">
			{/* Header Greetings */}
			<Header
				title={`Hello, ${user?.name}`}
				description={`${getGreeting()}, Let's check your stats today!`}
			>
				{user?.role !== "admin" && (
					<div className="flex items-center gap-3">
						<h4>Balance: </h4>
						<h4 className="text-xl font-medium text-green-500">
							{(user as StaffProps)?.balance} {currencyCode}
						</h4>
					</div>
				)}
			</Header>

			{/* Stats */}
			<div className="w-full grid grid-cols-4 gap-4">
				{statItems.map((stat, index) => (
					<div
						key={index}
						className={cn(
							"max-w-md py-6 px-8 rounded-3xl flex items-start gap-4 flex-col",
							stat.colorScheme.bg
						)}
					>
						{loadingStats ? (
							<Skeleton className="w-1/2 h-8" />
						) : (
							<h2 className="text-4xl font-medium">{stat.value}</h2>
						)}
						<div className="flex items-center gap-4 py-2 w-full">
							{loadingStats ? (
								<Skeleton className="w-8 h-8 p-2 rounded-full" />
							) : (
								<stat.icon size={28} className={cn(stat.colorScheme.text)} />
							)}
							<div className="w-full space-y-1">
								{loadingStats ? (
									<>
										<Skeleton className="w-full h-4" />
										<Skeleton className="w-full h-4" />
									</>
								) : (
									<>
										<h4 className="text-lg font-medium">{stat.title}</h4>
										{/* <h6 className="text-xs font-normal">since last month</h6> */}
									</>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Earnings Chart */}
			<div className="w-full min-h-40 grid grid-cols-12 gap-4">
				<Card className="max-w-full col-span-8 bg-slate-100/60 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Earnings
							<TrendingUp size={20} />
						</CardTitle>
						<CardDescription>January - June 2024</CardDescription>
					</CardHeader>

					{loadingStats && (
						<LoadingOverlay
							visible={loadingStats}
							zIndex={50}
							overlayProps={{ radius: "xs", blur: 0.5 }}
						/>
					)}

					<CardContent>
						{!loadingStats && (
							<ChartContainer config={chartConfig}>
								<LineChart
									accessibilityLayer
									data={chartData}
									margin={{
										left: 12,
										right: 12,
									}}
									throttleDelay={10000}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="month"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(value) => value.slice(0, 3)}
									/>
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent />}
									/>
									<ChartLegend content={<ChartLegendContent />} />
									<Line
										dataKey="earnings"
										type="natural"
										stroke="hsl(var(--chart-1))"
										strokeWidth={2}
										dot={true}
									/>
									<Line
										dataKey="orders"
										type="natural"
										stroke="hsl(var(--chart-2))"
										strokeWidth={2}
										dot={true}
									/>
									<Line
										dataKey="customers"
										type="natural"
										stroke="hsl(var(--chart-3))"
										strokeWidth={2}
										dot={true}
									/>
								</LineChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>

				{/* Recent Orders */}
				<Card className="max-w-full col-span-4 bg-slate-100/60 backdrop-blur-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Recent Orders
							<CircleCheckBig size={20} />
						</CardTitle>
						<CardDescription>Latest orders on your store</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 pb-4 px-0">
						<Separator className="bg-slate-200 mb-4" />
						{stats.recentOrders.map((recentOrder, index) => (
							<div
								key={index}
								className="flex items-center justify-between py-2 px-5 transition-all duration-300 hover:bg-slate-100 rounded-md cursor-pointer"
							>
								<div className="flex items-center gap-4">
									{loadingStats ? (
										<Skeleton className="w-8 h-8 rounded-full" />
									) : (
										<Avatar className="h-8 w-8 rounded-full">
											<AvatarImage
												src={AvatarImg}
												alt={recentOrder.customerName}
											/>
											<AvatarFallback className="rounded-full">
												{recentOrder.customerName}
											</AvatarFallback>
										</Avatar>
									)}
									<div className="flex items-start flex-col gap-1">
										{loadingStats ? (
											<Skeleton className="w-60 h-6" />
										) : (
											<>
												<h5 className="text-sm font-medium">
													{recentOrder.customerName}
												</h5>
												<h6 className="text-xs font-normal text-gray">
													{recentOrder.customerEmail || "N/A"}
												</h6>
											</>
										)}
									</div>
								</div>
								<h4 className="text-lg font-medium">
									{orderTotalCouponCheckedPrices[recentOrder.orderId] != null
										? `${orderTotalCouponCheckedPrices[
												recentOrder.orderId
										  ].toLocaleString()} ${currencyCode}`
										: "Calculating..."}
								</h4>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Top Selling Products */}
			<div className="w-full min-h-32 grid grid-cols-12 gap-4">
				<Card
					className={cn(
						"w-full",
						user?.role === "admin" ? "col-span-8" : "col-span-12"
					)}
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Top Selling Products
							<Activity size={20} />
						</CardTitle>
						<CardDescription>
							Best selling products on your store
						</CardDescription>
					</CardHeader>
					<CardContent className="px-0">
						<Table className="px-0 w-full">
							<TableHeader>
								<TableRow className="bg-slate-100 hover:bg-slate-100">
									<TableHead className="w-[60px]">S/No</TableHead>
									<TableHead>Product Name</TableHead>
									<TableHead>Product Code</TableHead>
									<TableHead>Product Category</TableHead>
									<TableHead>Total Sold Units</TableHead>
									<TableHead>Total Earned</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loadingStats
									? Array.from({ length: 5 }).map((_, index) => (
											<TableRow key={index}>
												<TableCell>
													<Skeleton className="w-10 h-4" />
												</TableCell>
												<TableCell>
													<Skeleton className="w-32 h-4" />
												</TableCell>
												<TableCell>
													<Skeleton className="w-16 h-4" />
												</TableCell>
												<TableCell>
													<Skeleton className="w-24 h-4" />
												</TableCell>
												<TableCell>
													<Skeleton className="w-16 h-4" />
												</TableCell>
											</TableRow>
									  ))
									: stats.topSellingProducts?.map((topProduct, index) => (
											<TableRow key={index}>
												<TableCell>#{index + 1}</TableCell>
												<TableCell>{topProduct.product.name}</TableCell>
												<TableCell>
													<Badge size="sm">{topProduct.product.sku}</Badge>
												</TableCell>
												<TableCell>
													{topProduct.product?.category?.name ||
														"Uncategorized"}
												</TableCell>
												<TableCell>
													{topProduct.totalQuantity} (pieces)
												</TableCell>
												<TableCell>
													{topProduct.totalRevenue.toLocaleString()} (
													{currencyCode})
												</TableCell>
											</TableRow>
									  )) || []}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Staffs List */}
				{user?.role === "admin" && (
					<Card className="max-w-full col-span-4 bg-slate-100/60 backdrop-blur-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Manage Staff
								<Users size={20} />
							</CardTitle>
							<CardDescription>
								See glimps of all the staff of your store.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 pb-4 px-0">
							<Separator className="bg-slate-200 mb-4" />
							{stats.staffs.map((staff, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-2 px-5 transition-all duration-300 hover:bg-slate-100 rounded-md cursor-pointer"
								>
									<div className="flex items-center gap-4">
										{loadingStats ? (
											<Skeleton className="w-8 h-8 rounded-full" />
										) : (
											<Avatar className="h-8 w-8 rounded-full">
												<AvatarImage
													src={
														staff.avatar !== "null"
															? urljoin(apiStaticURL, "/avatars", staff.avatar)
															: AvatarImg
													}
													alt={staff.name}
												/>
												<AvatarFallback className="rounded-full">
													{staff.name}
												</AvatarFallback>
											</Avatar>
										)}
										<div className="flex items-start flex-col gap-1">
											{loadingStats ? (
												<Skeleton className="w-60 h-6" />
											) : (
												<>
													<h5 className="text-sm font-medium">{staff.name}</h5>
													<h6 className="text-xs font-normal text-gray capitalize">
														{staff.role}
													</h6>
												</>
											)}
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<h6 className="text-xs font-normal">
											Balance: {staff.balance} {currencyCode}
										</h6>
										<h4 className="text-lg font-medium">
											<Badge
												variant={
													staff.status === "online" ? "success" : "destructive"
												}
											>
												{staff.status}
											</Badge>
										</h4>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</section>
	);
};

export default Dashboard;
