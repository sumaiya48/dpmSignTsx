import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProduct } from "@/hooks/use-product";
import ProductGrid from "./product-grid";
import CartPanel from "./cart-panel";

const POSLayout = () => {
	const { products } = useProduct();
	const isMobile = useIsMobile();
	const [isCartVisible, setIsCartVisible] = useState(!isMobile);

	// Hide cart when switching to mobile
	useEffect(() => {
		if (isMobile) {
			setIsCartVisible(false);
		} else {
			setIsCartVisible(true);
		}
	}, [isMobile]);

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			{/* Header */}
			<header className="h-10 border-b border-neutral-500/30 bg-white flex items-center justify-between px-4 shrink-0">
				<div className="flex items-center gap-2">
					<h1 className="text-lg font-semibold">POS System</h1>
				</div>
			</header>

			<div className="flex-1 flex gap-2 overflow-hidden min-h-0 ">
				{/* Product grid */}
				<div
					className={`
            p-4 overflow-y-auto overflow-x-hidden
            ${isCartVisible && isMobile ? "hidden" : "block"}
          `}
				>
					<ProductGrid products={products} />
				</div>

				{/* Cart panel */}
				<div
					className={`
            w-full md:w-[350px] lg:w-[400px] 
            ${!isCartVisible ? "hidden" : "block"}
            ${isMobile ? "absolute inset-0 z-50 bg-white" : "relative"}
          `}
				>
					<CartPanel />
				</div>
			</div>
		</div>
	);
};

export default POSLayout;
