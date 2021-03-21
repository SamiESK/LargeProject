import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';

import LoginPage from './pages/LoginPage';


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
		<Redirect to="/" />
		</Switch>  
		</Router>
	);
}

export default App;

