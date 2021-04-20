import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import FormLabel from "@material-ui/core/FormLabel";

import SideBar from "./profileBar.component";
import Cookies from "js-cookie";
import axios from "axios";
import { buildPath, useLocalStorage } from "../config";

import { useStylesProfile as useStyles } from "../config";

export default function Profile(darkState, handleThemeChange, title) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [user, setUser] = useState({});

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = async () => {
        if (Cookies.get("jwt") !== undefined) {
            const res = await axios.get(buildPath("api/user/info"), {
                withCredentials: true,
            });

            if (res.data.success) {
                setUser(res.data.user);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
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
                                <SideBar selected={"home"} />
                                <Grid
                                    item
                                    xs={12}
                                    sm={8}
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Grid item align='center' xs={12}>
                                        <FormLabel component="h5" variant="h5">
                                            First Name:
                                            <Typography
                                                color="textPrimary"
                                                variant="h6"
                                            >
                                                {user.firstName}
                                            </Typography>
                                        </FormLabel>
                                    </Grid>
                                    {user.githubId ? (
                                        ""
                                    ) : (
                                        <Grid align='center' item xs={12}>
                                            <FormLabel
                                                component="h5"
                                                variant="h5"
                                            >
                                                Last Name:
                                                <Typography
                                                    color="textPrimary"
                                                    variant="h6"
                                                >
                                                    {user.lastName}
                                                </Typography>
                                            </FormLabel>
                                        </Grid>
                                    )}
                                    <Grid item align='center' xs={12}>
                                        <FormLabel component="h5" variant="h5">
                                            Email:
                                            <Typography
                                                color="textPrimary"
                                                variant="h6"
                                            >
                                                {user.email}
                                            </Typography>
                                        </FormLabel>
                                    </Grid>

                                    <Grid item align='center' xs={12}>
                                        <FormLabel component="h5" variant="h5">
                                            Verification Status:
                                            <Typography
                                                color="textPrimary"
                                                variant="h6"
                                            >
                                                {user.isVerified
                                                    ? "Your email is verified!"
                                                    : "Your email is not verified..."}
                                            </Typography>
                                        </FormLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
                <Box mt={3}>
                    <Copyright />
                    <br />
                </Box>
            </Grid>
        </Grid>
    );
}
