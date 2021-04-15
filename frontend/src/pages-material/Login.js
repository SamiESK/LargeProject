import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { buildPath, buildRedirectPath } from "../config";
import Copyright from "./Copyright";

import {
    GoogleLoginButton,
    MicrosoftLoginButton,
    GithubLoginButton,
} from "react-social-login-buttons";

import { useStyles } from "../config";

function SignInSide({ handleThemeChange, darkState }) {
    const classes = useStyles();

    const [password, setPasword] = useState("");
    const [email, setEmail] = useState("");

    const handlePasswordChange = (event) => {
        setPasword(event.target.value);
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                buildPath("api/user/login"),
                {
                    email: email,
                    password: password,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("calendar");
            } else {
                // display error
            }
        } catch (err) {
            console.error(err);
        }

        // alert(`${email} ${password}, ${e.target.email.value} ${e.target.password.value}`);
    };

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid
                item
                xs={12}
                sm={8}
                md={5}
                component={Paper}
                elevation={6}
                square
            >
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item xs>
                                <Link href="/get-reset-code" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <br />
                        <Typography align="center">or</Typography>
                        <br />
                        <GoogleLoginButton
                            onClick={() =>
                                (window.location.href = buildPath(
                                    "auth/google"
                                ))
                            }
                        />
                        <MicrosoftLoginButton
                            onClick={() =>
                                (window.location.href = buildPath(
                                    "auth/microsoft"
                                ))
                            }
                        />
                        <GithubLoginButton
                            onClick={() =>
                                (window.location.href = buildPath(
                                    "auth/github"
                                ))
                            }
                        />
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}

export default SignInSide;
