import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
} from "react";
import { ProductProps } from "@/hooks/use-product";
import { useToast } from "@/hooks/use-toast";
import { couponService } from "@/api";

export interface CartItemProps {
	cartItemId: number;
	productId?: number;
	unlistedProductId?: number;
	product: ProductProps;
	productVariantId?: number;
	productVariant?: {
		productVariantId: number;
		productId: number;
		additionalPrice: number;
		variantDetails: {
			productVariationDetailId: number;
			productVariantId: number;
			variationItemId: number;
			variationItem: {
				value: string;
				// variation: {
				// 	name: string;
				// 	unit: string;
				// };
			};
		}[];
	};
	quantity: number;
	size: number | null;
	widthInch: number | null;
	heightInch: number | null;
	price: number;
}

export interface OrderSummary {
	subtotal: number;
	discount: number;
	total: number;
	couponCode?: string;
}

interface CartContextType {
	cartItems: CartItemProps[];
	orderSummary: OrderSummary;
	addToCart: (item: CartItemProps) => void;
	removeFromCart: (cartItemId: number) => void;
	updateQuantity: (cartItemId: number, quantity: number) => void;
	clearCart: () => void;
	checkCoupon: (code: string) => void;
	removeCoupon: () => void;
	discount: number;
	setDiscount: React.Dispatch<React.SetStateAction<number>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const { toast } = useToast();
	const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
	const [code, setCouponCode] = useState<string | undefined>();
	const [discount, setDiscount] = useState<number>(0);

	// Calculate order summary
	const calculateOrderSummary = useCallback((): OrderSummary => {
		const subtotal = cartItems.reduce((total, item) => {
			return total + item.price;
		}, 0);

		const total = subtotal - discount;

		return {
			subtotal,
			discount,
			total,
			couponCode: code,
		};
	}, [cartItems, discount, code]);

	// Add item to cart
	const addToCart = useCallback((newItem: CartItemProps) => {
		// setItems((prev) => {
		// 	// Check if this product variant is already in the cart
		// 	const existingItemIndex = prev.findIndex(
		// 		(item) =>
		// 			item.product.productId === newItem.product.productId &&
		// 			// // Compare all selected variations
		// 			// JSON.stringify(item.selectedVariations.sort()) ===
		// 			// 	JSON.stringify(newItem.selectedVariations.sort()) &&
		// 			// item.customText === newItem.customText

		// 			// Compare all selected variations
		// 			JSON.stringify(item.selectedVariationItems.sort()) ===
		// 				JSON.stringify(newItem.selectedVariationItems.sort())
		// 	);

		// 	if (existingItemIndex >= 0) {
		// 		// Update quantity of existing item
		// 		const newItems = [...prev];
		// 		newItems[existingItemIndex].quantity += newItem.quantity;
		// 		toast({
		// 			description: `Updated quantity of ${
		// 				newItem.product.name || newItem.product.sku
		// 			}`,
		// 			variant: "success",
		// 			duration: 10000,
		// 		});
		// 		return newItems;
		// 	} else {
		// 		// Add new item
		// 		toast({
		// 			description: `Added ${
		// 				newItem.product.name || newItem.product.sku
		// 			} to cart`,
		// 			variant: "success",
		// 			duration: 10000,
		// 		});
		// 		return [...prev, newItem];
		// 	}
		// });

		setCartItems((prevItems: CartItemProps[]) => {
			// const existingItemIndex = prevItems.findIndex((item) => item.productId === newItem.productId);

			// if(existingItemIndex >= 0) {
			// 			const newItems = [...prevItems];
			// 			newItems[existingItemIndex].quantity += newItem.quantity;
			// 			toast({
			// 				description: `Updated quantity of ${
			// 					newItem.product.name || newItem.product.sku
			// 				}`,
			// 				variant: "success",
			// 				duration: 10000,
			// 			});
			// 			return newItems;
			// }

			return [...prevItems, newItem];
		});
	}, []);

	// Remove item from cart
	const removeFromCart = useCallback((cartItemId: number) => {
		setCartItems((prev) => {
			const itemToRemove = prev.find((item) => item.cartItemId === cartItemId);
			if (itemToRemove) {
				toast({
					description: `Removed ${
						itemToRemove.product.name || itemToRemove.product.sku
					} from cart`,
					variant: "default",
					duration: 10000,
				});
			}
			return prev.filter((item) => item.cartItemId !== cartItemId);
		});
	}, []);

	// Update item quantity
	const updateQuantity = useCallback(
		(cartItemId: number, quantity: number) => {
			if (quantity < 1) {
				removeFromCart(cartItemId);
				return;
			}

			setCartItems((prev) =>
				prev.map((item) =>
					item.cartItemId === cartItemId ? { ...item, quantity } : item
				)
			);
		},
		[removeFromCart]
	);

	// Clear cart
	const clearCart = useCallback(() => {
		setCartItems([]);
		setCouponCode(undefined);
		setDiscount(0);
		toast({
			description: "Cart cleared",
			variant: "default",
			duration: 10000,
		});
	}, []);

	// Apply coupon
	const checkCoupon = useCallback(
		async (code: string) => {
			try {
				if (code.trim().length === 0) {
					toast({
						description: "Please enter a coupon code",
						variant: "destructive",
						duration: 10000,
					});
					return;
				}

				if (code.length > 0) {
					const response = await couponService.checkCouponStatus(
						code,
						orderSummary.subtotal
					);

					if (response.data.valid === true && response.status === 200) {
						setCouponCode(code);
						setDiscount(
							response.data.totalPrice - response.data.discountedPrice
						);

						toast({
							description: "Coupon applied.",
							variant: "success",
							duration: 10000,
						});

						return response.data;
					}
				}
			} catch (err: any) {
				setCouponCode(undefined);
				console.log(err.message);
				toast({
					description: err.message,
					variant: "destructive",
					duration: 10000,
				});
			}
		},
		[cartItems]
	);

	// Remove coupon
	const removeCoupon = useCallback(() => {
		setCouponCode(undefined);
		setDiscount(0);
		toast({
			description: "Coupon removed",
			variant: "default",
			duration: 10000,
		});
	}, []);

	const orderSummary = calculateOrderSummary();

	const value = {
		cartItems,
		orderSummary,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		checkCoupon,
		removeCoupon,
		discount,
		setDiscount,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
