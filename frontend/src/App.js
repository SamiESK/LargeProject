import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ResetPage from './pages/ResetPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';


function App() {
	return (
		<Router >
		<Switch>
		<Route path="/" exact>
		<LoginPage />
		</Route>
		<Route path="/HomePage" exact>
			<HomePage />
		</Route>
		<Route path="/ResetPage" exact>
			<ResetPage />
		</Route>
		<Route path="/AccountPage" exact>
			<AccountPage />
		</Route>
		<Redirect to="/" />
		</Switch>  
		</Router>
	);
}

export default App;

