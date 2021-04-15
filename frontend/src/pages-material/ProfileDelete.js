import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";

import SideBar from "./profileBar.component";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import axios from "axios";
import { buildPath, checkAuth, useLocalStorage } from "../config";

import { useStylesProfile as useStyles } from "../config";

export default function ProfileDelete(darkState, handleThemeChange) {
    const classes = useStyles();

    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                buildPath("api/user/delete-account"),
                {
                    password: password,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                document.cookie =
                    "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
            } else {
                // display error
            }
        } catch (err) {
            console.error(err);
        }

        // alert(`${email} ${password}, ${e.target.email.value} ${e.target.password.value}`);
    };

    const [auth, setAuth] = useLocalStorage("auth", false);

    useEffect(() => {
        checkAuth(auth);
    }, []);

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={12} className={classes.image} />
            <Grid xs={12} sm={8} md={12} elevation={6}>
                <div className={classes.paper}>
                    <Card>
                        <CardContent>
                            <Grid container justify="flex-end" spacing={2}>
                                <SideBar selected={"delete"} />
                                <Grid
                                    item
                                    xs={12}
                                    sm={8}
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Typography component="h1" variant="h5">
                                        Delete Account
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        Please input your password to confirm
                                        account deletion.
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
                                                    variant="outlined"
                                                    required
                                                    fullWidth
                                                    name="password"
                                                    label="Password"
                                                    type="password"
                                                    id="password"
                                                    autoComplete="current-password"
                                                    value={password}
                                                    onChange={(event) => {
                                                        setPassword(
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
                                            Delete Account
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
