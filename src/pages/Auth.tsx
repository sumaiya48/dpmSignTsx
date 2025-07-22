import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Logo from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import { Eye, EyeClosed } from "lucide-react";
import routes from "@/routes";
import { frontendLandingPageURL } from "@/lib/dotenv";
import { authService } from "@/api";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useToast } from "@/hooks/use-toast";
import { useDisclosure } from "@mantine/hooks";
import { LoadingOverlay } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";

interface LoginFormProps {
	email: string;
	password: string;
}

interface RegistrationFormProps {
	name: string;
	email: string;
	phone: string;
	password: string;
}

const Auth = () => {
	const { toast } = useToast();

	const { login } = useAuth();
	const [loading, setLoading] = useDisclosure(false);
	const [showPassword, setShowPassword] = useState(false);
	const [canRegisterAdmin, setCanRegisterAdmin] = useState<boolean>(false);
	const [registrationFormData, setRegistrationFormData] =
		useState<RegistrationFormProps>({
			name: "",
			email: "",
			phone: "",
			password: "",
		});

	const [loginFormData, setLoginFormData] = useState<LoginFormProps>({
		email: "",
		password: "",
	});

	const { errors, validateField, validateForm } = useFormValidation();

	useMemo(async () => {
		try {
			const response = await authService.canRegisterAdmin();
			setCanRegisterAdmin(response.data.canRegisterAdmin);
		} catch (err: any) {
			console.log(err.message);
			setCanRegisterAdmin(false);
		}
	}, []);

	const handleRegistrationFormData = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setRegistrationFormData({
			...registrationFormData,
			[name]: value,
		});
		validateField(name, value, authService.adminRegistrationSchema);
	};

	const handleLoginFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLoginFormData({
			...loginFormData,
			[name]: value,
		});
		validateField(name, value, authService.loginSchema);
	};

	const handleRegistration = async () => {
		try {
			if (
				validateForm(registrationFormData, authService.adminRegistrationSchema)
			) {
				setLoading.open();

				const result = await authService.registerAdmin(
					registrationFormData.name,
					registrationFormData.email,
					registrationFormData.phone,
					registrationFormData.password
				);

				login(result.data.authToken, result.data?.admin);

				toast({
					title: `Welcome aboard, ${registrationFormData.name}!`,
					description:
						"Let's get started and build something amazing together!",
					variant: "success",
					duration: 10000,
				});
			}
		} catch (err: any) {
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	const handleLogin = async () => {
		try {
			if (validateForm(loginFormData, authService.loginSchema)) {
				setLoading.open();

				const result = await authService.login(
					loginFormData.email,
					loginFormData.password
				);

				login(result.data.authToken, result.data?.admin || result.data?.staff);

				toast({
					title: `Welcome back, ${
						result.data?.admin
							? result.data?.admin.name
							: result.data?.staff.name
					}!`,
					description: "Ready to take charge and make things happen?",
					variant: "success",
					duration: 10000,
				});
			}
		} catch (err: any) {
			console.log(err.message);
			toast({
				description: err.message,
				variant: "destructive",
				duration: 10000,
			});
		} finally {
			setLoading.close();
		}
	};

	return (
		<section className="py-10 w-full">
			<div className="row py-5 min-h-screen flex items-center justify-center">
				<Card className="w-[500px] relative">
					<LoadingOverlay
						visible={loading}
						zIndex={10}
						overlayProps={{ blur: 2 }}
					/>

					<CardHeader className="text-center">
						<div className="flex items-center justify-center pb-5">
							<Link to={routes.auth.path}>
								<img src={Logo} className="w-56" alt="Dhaka Plastic & Metal" />
							</Link>
						</div>
						<CardTitle>Dhaka Plastic & Metal</CardTitle>
						<CardDescription>
							{canRegisterAdmin ? "Admin Registration" : "Login"}
						</CardDescription>
					</CardHeader>

					<CardContent>
						{canRegisterAdmin && (
							<div className="space-y-2 my-4">
								<Label htmlFor="name" className="cursor-pointer">
									Name
									<span className="text-skyblue"> *</span>
								</Label>
								<Input
									type="text"
									id="name"
									name="name"
									placeholder="your name"
									value={registrationFormData.name}
									onChange={handleRegistrationFormData}
									error={errors.name ? true : false}
								/>

								{errors.name && (
									<p className="text-rose-500 font-medium text-xs">
										{errors.name}
									</p>
								)}
							</div>
						)}
						<div className="space-y-2 my-4">
							<Label htmlFor="email" className="cursor-pointer">
								Email
								<span className="text-skyblue"> *</span>
							</Label>
							<Input
								type="email"
								id="email"
								name="email"
								placeholder="your email"
								value={
									canRegisterAdmin
										? registrationFormData.email
										: loginFormData.email
								}
								onChange={
									canRegisterAdmin
										? handleRegistrationFormData
										: handleLoginFormData
								}
								error={errors.email ? true : false}
							/>

							{errors.email && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.email}
								</p>
							)}
						</div>
						{canRegisterAdmin && (
							<div className="space-y-2 my-4">
								<Label htmlFor="phone" className="cursor-pointer">
									Phone
									<span className="text-skyblue"> *</span>
								</Label>
								<Input
									type="text"
									id="phone"
									name="phone"
									placeholder="017......."
									value={registrationFormData.phone}
									onChange={handleRegistrationFormData}
									error={errors.phone ? true : false}
								/>

								{errors.phone && (
									<p className="text-rose-500 font-medium text-xs">
										{errors.phone}
									</p>
								)}
							</div>
						)}
						<div className="space-y-2 my-4">
							<Label htmlFor="password" className="cursor-pointer">
								Password
								<span className="text-skyblue"> *</span>
							</Label>
							<div className="flex w-full items-center space-x-2 relative">
								<Input
									type={showPassword ? "text" : "password"}
									id="password"
									name="password"
									placeholder="your password"
									value={
										canRegisterAdmin
											? registrationFormData.password
											: loginFormData.password
									}
									onChange={
										canRegisterAdmin
											? handleRegistrationFormData
											: handleLoginFormData
									}
									error={errors.password ? true : false}
								/>
								{showPassword ? (
									<EyeClosed
										size={20}
										className="cursor-pointer text-gray absolute right-5"
										onClick={() => setShowPassword(false)}
									/>
								) : (
									<Eye
										size={20}
										className="cursor-pointer text-gray absolute right-5"
										onClick={() => setShowPassword(true)}
									/>
								)}
							</div>
							{errors.password && (
								<p className="text-rose-500 font-medium text-xs">
									{errors.password}
								</p>
							)}
						</div>

						{errors.global && (
							<p className="text-rose-500 font-medium text-xs">
								{errors.global}
							</p>
						)}
					</CardContent>
					<CardFooter className="flex justify-between">
						<Link target="_blank" to={frontendLandingPageURL}>
							<Button variant="outline">Go to Landing Page</Button>
						</Link>
						<Button
							onClick={canRegisterAdmin ? handleRegistration : handleLogin}
						>
							Enter
						</Button>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
};

export default Auth;
