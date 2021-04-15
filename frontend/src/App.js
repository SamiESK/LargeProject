import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from "react-router-dom";
import "./App.css";

import Login from "./pages-material/Login";
import Signup from "./pages-material/Signup";
import GetResetCode from "./pages-material/GetResetCode";
import PasswordReset from "./pages-material/PasswordReset";
import Verified from "./pages-material/Verified";
import Unverified from "./pages-material/Unverified";
import Profile from "./pages-material/Profile";
import ProfileDelete from "./pages-material/ProfileDelete";
import ProfileUpdate from "./pages-material/ProfileUpdate";
import Home from "./pages-material/Home";
import Calendar from "./pages-material/Calendar";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { green } from "@material-ui/core/colors";

import { useLocalStorage, isAuthenticated } from "./config";

import UserNavBar from "./pages-material/userNavBar.component";

// <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
// <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    // const theme = React.useMemo(
    //   () =>
    //     createMuiTheme({
    //       palette: {
    //         type: prefersDarkMode ? 'dark' : 'light',
    //       },
    //     }),
    //   [prefersDarkMode],
    // );

    // Similar to useState but first arg is key to the value in local storage.
    const [darkState, setDarkState] = useLocalStorage(
        "darkMode",
        prefersDarkMode
    );

    const [auth, setAuth] = useLocalStorage("auth", false);

    isAuthenticated().then((bool) => {
        setAuth(bool);
    });

    // const [darkState, setDarkState] = useState(prefersDarkMode);
    const palletType = darkState ? "dark" : "light";
    const mainPrimaryColor = darkState ? green[700] : green[500];
    const mainSecondaryColor = darkState ? green[900] : green["A400"];
    const darkTheme = createMuiTheme({
        palette: {
            type: palletType,
            primary: {
                main: mainPrimaryColor,
            },
            secondary: {
                main: mainSecondaryColor,
            },
        },
    });

    const handleThemeChange = () => {
        setDarkState(!darkState);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <UserNavBar
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                            auth={auth}
                        />
                        <Home />
                    </Route>
                    <Route path="/login" exact>
                        <Login
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/signup" exact>
                        <Signup
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/calendar" exact>
                        <UserNavBar
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                            auth={auth}
                        />
                        <Calendar />
                    </Route>
                    <Route path="/get-reset-code">
                        <GetResetCode
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/password-reset" exact>
                        <PasswordReset
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/profile" exact>
                        <UserNavBar
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                            auth={auth}
                        />
                        <Profile
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/profile/update" exact>
                        <UserNavBar
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                            auth={auth}
                        />
                        <ProfileUpdate
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/profile/delete" exact>
                        <UserNavBar
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                            auth={auth}
                        />
                        <ProfileDelete
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/verified">
                        <Verified
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Route path="/unverified">
                        <Unverified
                            darkState={darkState}
                            handleThemeChange={handleThemeChange}
                        />
                    </Route>
                    <Redirect to="/" />
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
