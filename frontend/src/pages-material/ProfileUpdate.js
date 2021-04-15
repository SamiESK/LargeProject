import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import SideBar from "./profileBar.component";
import axios from "axios";
import Cookies from "js-cookie";
import { buildPath, checkAuth, useLocalStorage } from "../config";

import { useStylesProfile as useStyles } from "../config";

export default function ProfileUpdate(darkState, handleThemeChange) {
    const classes = useStyles();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const getInfo = async () => {
        if (Cookies.get("jwt") !== undefined) {
            const res = await axios.get(buildPath("api/user/info"), {
                withCredentials: true,
            });

            if (res.data.success) {
                setFirstName(res.data.user.firstName);
                setLastName(res.data.user.lastName);
                setEmail(res.data.user.email);
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const [auth, setAuth] = useLocalStorage("auth", false);

    useEffect(() => {
        checkAuth(auth);
        getInfo(auth);
    }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let update = {
                firstName: firstName,
                lastName: lastName,
                email: email,
            };

            if (password !== "" && password2 !== "") {
                update.password = password;
                update.repeat_password = password2;
            }

            const res = await axios.patch(
                buildPath("api/user/update"),
                update,
                { withCredentials: true }
            );

            if (res.data.success) {
                getInfo();
                // document.location.reload();
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
            <Grid item xs={false} sm={4} md={12} className={classes.image} />
            <Grid xs={12} sm={8} md={12} elevation={6}>
                <div className={classes.paper}>
                    <Card>
                        <CardContent>
                            <Grid container justify="flex-end" spacing={2}>
                                <SideBar selected={"update"} />
                                <Grid
                                    item
                                    xs={12}
                                    sm={8}
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Typography component="h1" variant="h5">
                                        Update Information
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        You can change your information with the
                                        following fields
                                    </Typography>
                                    <form
                                        className={classes.form}
                                        noValidate
                                        onSubmit={handleSubmit}
                                    >
                                        <Grid
                                            container
                                            justify="flex-end"
                                            spacing={2}
                                        >
                                            <Grid item xs={12}>
                                                <TextField
                                                    autoComplete="fname"
                                                    name="firstName"
                                                    variant="outlined"
                                                    fullWidth
                                                    id="firstName"
                                                    label="First Name"
                                                    autoFocus
                                                    value={firstName}
                                                    onChange={(event) => {
                                                        setFirstName(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="lastName"
                                                    label="Last Name"
                                                    name="lastName"
                                                    autoComplete="lname"
                                                    value={lastName}
                                                    onChange={(event) => {
                                                        setLastName(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="email"
                                                    label="Email Address"
                                                    name="email"
                                                    autoComplete="email"
                                                    value={email}
                                                    onChange={(event) => {
                                                        setEmail(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    name="password"
                                                    label="New Password"
                                                    type="password"
                                                    id="password"
                                                    autoComplete="new-password"
                                                    value={password}
                                                    onChange={(event) => {
                                                        setPassword(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    name="password2"
                                                    label="Confirm New Password"
                                                    type="password"
                                                    id="password2"
                                                    autoComplete="new-password"
                                                    value={password2}
                                                    onChange={(event) => {
                                                        setPassword2(
                                                            event.target.value
                                                        );
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <br />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >
                                            Update
                                        </Button>
                                        <Box mt={5}>
                                            <Copyright />
                                        </Box>
                                    </form>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
            </Grid>
        </Grid>
    );
}
