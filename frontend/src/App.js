import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ResetPage from './pages/ResetPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import GetCodePage from './pages/GetCodePage';


function App() {
	return (
		<Router >
		<Switch>
		<Route path="/" exact>
		<LoginPage />
		</Route>
		<Route path="/login" exact>
		<LoginPage />
		</Route>
		<Route path="/signup" exact>
		<LoginPage />
		</Route>
		<Route path="/calendar" exact>
			<HomePage />
		</Route>
		<Route path="/password-reset" exact>
			<ResetPage />
		</Route>
		<Route path="/profile" exact>
			<AccountPage />
		</Route>
		<Route path="/get-reset-code">
			<GetCodePage />
		</Route>
		<Route path="/verified">
			<GetCodePage />
		</Route>
		<Route path="/unverified">
			<GetCodePage />
		</Route>
		<Redirect to="/" />
		</Switch>
		</Router>
	);
}

export default App;

