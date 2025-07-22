import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import routes from "@/routes";
import Preloader from "@/components/preloader";

interface ProtectedRouteProps {
	isPublic?: boolean;
	redirectPath: string;
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	isPublic = false,
	redirectPath,
	children,
}) => {
	const { loading, authToken, user, navigateTo } = useAuth();

	// Wait for loading to complete
	if (loading) {
		return <Preloader />; // Or return a loading spinner
	}

	// If the route is public and the user is authenticated, redirect them
	if (isPublic && authToken && user) {
		return <Navigate to={navigateTo ? navigateTo : redirectPath} replace />;
	}

	if (isPublic && !authToken) {
		return <>{children}</>;
	}

	// If the route is not public and the user is not authenticated, redirect them
	if (!isPublic && !authToken) {
		return <Navigate to={routes.auth.path} replace />;
	}

	// Otherwise, render the route
	// return <Outlet />;
	return <>{children}</>;
};

export default ProtectedRoute;
