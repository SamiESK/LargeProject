import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
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

import { useStylesProfile as useStyles } from "../config";

export default function Home() {
    const classes = useStyles();

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={12} className={classes.image} />
            <Grid xs={12} sm={8} md={12} elevation={6}>
                <div className={classes.paper}>
                    <Card>
                        <CardContent>
                            <Grid
                                item
                                xs={12}
                                sm={8}
                                direction="column"
                                justify="center"
                                alignItems="center"
                            >
                                <Typography component="h1" variant="h5">
                                    Welcome to Eventree !!
                                </Typography>
                                <Typography component="h1" variant="body2">
                                    Eventree is a modern and simple calendar to
                                    fulfill you scheduling needs.
                                </Typography>

                                <br/>
                                <Typography component="h1" variant="body2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                    onClick={()=> window.location.href = '/signup'}
                                >
                                    Sign up
                                </Button> or {' '}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Sign in
                                </Button>
                                </Typography>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
            </Grid>
        </Grid>
    );
}
