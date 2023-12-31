import { useEffect, useState } from 'react';
import { Header, Container, Group, Burger, Paper, Transition, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { HEADER_HEIGHT, links, linksLogged } from './data';
import useStyles from './styles';
import Link from 'next/link';
import { useRouter } from 'next/router'
import Cookies from 'js-cookie';


export default function HeaderResponsive() {
	const router = useRouter();
	const [opened, { toggle, close }] = useDisclosure(false);
	const [active, setActive] = useState(router.asPath);
	const { classes, cx } = useStyles();
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	// Get the current page URL
	const currentUrl = router.asPath;

	console.log("Current URL: " + currentUrl);

	useEffect(() => {
		setActive(router.asPath);
		Cookies.set("acc_no_supplier", '10000001');
		if (Cookies.get('email_supplier'))
			setIsLoggedIn(true);

	}, [router.asPath]);

	const itemsLogged = linksLogged.map((link) => (
		<Link
			key={link.label}
			href={link.link}
			className={cx(classes.link, { [classes.linkActive]: active === link.link })}
			onClick={(event) => {
				setActive(link.link);
				close();
			}}
		>
			{link.label}
		</Link>
	));
	const items = links.map((link) => (
		<Link
			key={link.label}
			href={link.link}
			className={cx(classes.link, { [classes.linkActive]: active === link.link })}
			onClick={(event) => {
				setActive(link.link);
				close();
			}}
		>
			{link.label}
		</Link>
	));


	return (
		<Header height={HEADER_HEIGHT} mb={120} className={classes.root}>
			<Container className={classes.header}>
				<Text color="white" size={28}>KolpoDrum</Text>
				<Group spacing={5} className={classes.links}>
					{isLoggedIn == true ? itemsLogged : items}
				</Group>

				<Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

				<Transition transition="pop-top-right" duration={200} mounted={opened}>
					{(styles) => (
						<Paper className={classes.dropdown} withBorder style={styles}>
							{isLoggedIn == true ? itemsLogged : items}
						</Paper>
					)}
				</Transition>
			</Container>
		</Header>
	);
}