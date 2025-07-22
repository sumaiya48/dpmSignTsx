import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useLocation } from "react-router-dom";

NProgress.configure({ showSpinner: false }); // Disable the spinner

const ProgressBar = () => {
	const location = useLocation();

	useEffect(() => {
		NProgress.start();
		// NProgress.inc(0.1);
		NProgress.done();
	}, [location]);

	return null;
};

export default ProgressBar;
