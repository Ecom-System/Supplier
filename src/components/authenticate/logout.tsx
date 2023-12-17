import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import Cookies from "js-cookie";
import { useEffect } from 'react';

export function Logout() {
	const router = useRouter();

	useEffect(() => {

		const isLoggedIn = Cookies.get('email_supplier');
		router.push('/');
		if (isLoggedIn) {
			Cookies.remove("email_supplier");

			showNotification({
				title: "Logged Out",
				message: "Log out successful",
				color: "teal",
				autoClose: 5000,
			});

			router.reload();
		}

	}, []);

	return (
		<></>
	);
}


