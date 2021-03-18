import React from 'react';

import PageTitle from '../components/PageTitle';
import Login from '../components/Login';
import NavBar from '../components/navBar';
import background from "../images/background.jpg";

const LoginPage = () =>
{

	return(
		<div id="background" style={{ backgroundImage: `url(${background})`}}>
		<NavBar />
		<PageTitle />
		
		</div>
	);
};

export default LoginPage;

