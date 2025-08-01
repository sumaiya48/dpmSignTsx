import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import Layout from "@/components/layout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import Media from "@/pages/Media";
import routes from "@/routes";
import Product from "@/pages/Product";
import AddProduct from "@/pages/AddProduct";
import Category from "@/pages/Category";
import ProductReview from "@/pages/ProductReview";
import Customer from "@/pages/Customer";
import FAQ from "@/pages/FAQ";
import Coupon from "@/pages/Coupon";
import AuthProvider from "@/hooks/use-auth";
import ProtectedRoute from "@/components/protected-route";
import CustomerProvider from "@/hooks/use-customer";
import InqueryProvider from "@/hooks/use-inquery";
import Inquery from "@/pages/Inquery";
import Newsletter from "@/pages/Newsletter";
import NewsletterProvider from "@/hooks/use-newsletter";
import Staff from "@/pages/Staff";
import StaffProvider from "@/hooks/use-staff";
import FaqProvider from "@/hooks/use-faq";
import Preloader from "@/components/preloader";
import { ping } from "@/api";
import { useEffect, useState } from "react";
import CategoryProvider from "@/hooks/use-category";
import ProductReviewProvider from "@/hooks/use-product-review";
import CouponProvider from "@/hooks/use-coupon";
import RequestedOrder from "@/pages/order/RequestedOrder";
import ProductProvider from "@/hooks/use-product";
import OrderProvider from "@/hooks/use-order"; // Import OrderProvider
import MediaProvider from "@/hooks/use-media";
import Blog from "@/pages/Blog";
import BlogProvider from "@/hooks/use-blog";
import CourierProvider from "@/hooks/use-courier";
import Courier from "@/pages/Courier";
import { CartProvider } from "@/hooks/use-cart";
import ActiveOrder from "@/pages/order/ActiveOrder";
import CompletedOrder from "@/pages/order/CompletedOrder";
import JobProvider from "@/hooks/use-job";
import Job from "@/pages/Job";
import Invoice from "@/components/invoice";
import TransactionProvider from "@/hooks/use-transaction";
import Transaction from "@/pages/Transaction";
import CancelledOrder from "@/pages/order/CancelledOrder";
import DashboardProvider from "@/hooks/use-dashboard";

const App = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const checkAPIHeartBeat = async () => {
        setLoading(true);
        try {
            const response = await ping();
            if (response.status === 200) {
                setLoading(false);
            }
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        checkAPIHeartBeat();
    }, []);

    return (
        <>
            <MantineProvider>
                {loading ? (
                    <>
                        <Preloader />
                    </>
                ) : (
                    <>
                        <Router>
                            <AuthProvider>
                                {/* Wrap all routes that might need OrderProvider inside it */}
                                <OrderProvider> {/* NEW: OrderProvider added here */}
                                    <Layout>
                                        <Routes>
                                            <Route
                                                path={routes.auth.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic
                                                        redirectPath={routes.dashboard.path}
                                                    >
                                                        <Auth />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.dashboard.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <DashboardProvider>
                                                            <CouponProvider>
                                                                <Dashboard />
                                                            </CouponProvider>
                                                        </DashboardProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.pos.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <StaffProvider>
                                                            <CourierProvider>
                                                                <ProductProvider>
                                                                    <CartProvider>
                                                                        <POS />
                                                                    </CartProvider>
                                                                </ProductProvider>
                                                            </CourierProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={"/invoice/:orderId"}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* OrderProvider is already here for Invoice */}
                                                        <StaffProvider>
                                                            <CouponProvider>
                                                                <CourierProvider>
                                                                    <Invoice />
                                                                </CourierProvider>
                                                            </CouponProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.order.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* OrderProvider is already here */}
                                                        <StaffProvider>
                                                            <CouponProvider>
                                                                <CourierProvider>
                                                                    <ActiveOrder />
                                                                </CourierProvider>
                                                            </CouponProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.order.requested.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* OrderProvider is already here */}
                                                        <StaffProvider>
                                                            <CouponProvider>
                                                                <CourierProvider>
                                                                    <RequestedOrder />
                                                                </CourierProvider>
                                                            </CouponProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.order.completed.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* OrderProvider is already here */}
                                                        <StaffProvider>
                                                            <CouponProvider>
                                                                <CourierProvider>
                                                                    <CompletedOrder />
                                                                </CourierProvider>
                                                            </CouponProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.order.cancelled.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* OrderProvider is already here */}
                                                        <StaffProvider>
                                                            <CouponProvider>
                                                                <CourierProvider>
                                                                    <CancelledOrder />
                                                                </CourierProvider>
                                                            </CouponProvider>
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.product.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <ProductProvider>
                                                            <CategoryProvider>
                                                                <Product />
                                                            </CategoryProvider>
                                                        </ProductProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.product.add.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <ProductProvider>
                                                            <CategoryProvider>
                                                                <AddProduct />
                                                            </CategoryProvider>
                                                        </ProductProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.product.review.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <ProductReviewProvider>
                                                            <ProductReview />
                                                        </ProductReviewProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.product.category.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <CategoryProvider>
                                                            <Category />
                                                        </CategoryProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.coupon.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <CouponProvider>
                                                            <CategoryProvider>
                                                                <Coupon />
                                                            </CategoryProvider>
                                                        </CouponProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.transaction.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <TransactionProvider>
                                                            <Transaction />
                                                        </TransactionProvider>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path={routes.customer.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <CustomerProvider>
                                                            <Customer />
                                                        </CustomerProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.staff.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        {/* StaffProvider is already here */}
                                                        <StaffProvider>
                                                            <Staff />
                                                        </StaffProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.inquery.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <InqueryProvider>
                                                            <Inquery />
                                                        </InqueryProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.media.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <MediaProvider>
                                                            <Media />
                                                        </MediaProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.newsletter.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <NewsletterProvider>
                                                            <Newsletter />
                                                        </NewsletterProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.faq.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <FaqProvider>
                                                            <FAQ />
                                                        </FaqProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.blog.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <BlogProvider>
                                                            <Blog />
                                                        </BlogProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.job.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <JobProvider>
                                                            <Job />
                                                        </JobProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path={routes.courier.path}
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <CourierProvider>
                                                            <Courier />
                                                        </CourierProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="*"
                                                element={
                                                    <ProtectedRoute
                                                        isPublic={false}
                                                        redirectPath={routes.auth.path}
                                                    >
                                                        <DashboardProvider>
                                                            <CouponProvider>
                                                                <Dashboard />
                                                            </CouponProvider>
                                                        </DashboardProvider>
                                                    </ProtectedRoute>
                                                }
                                            />
                                        </Routes>
                                    </Layout>
                                </OrderProvider> {/* NEW: Closes OrderProvider here */}
                            </AuthProvider>
                        </Router>
                    </>
                )}
            </MantineProvider>
        </>
    );
};

export default App;