import React from 'react';
import GetCode from '../components/getCode';
import NavBar from '../components/navBar';
import ResetPassword from '../components/resetPassword';

const ResetPage = () =>
{

	return(
		<div>
        <NavBar />
		<GetCode />
        <ResetPassword />
		</div>
		
	);
};

export default ResetPage;