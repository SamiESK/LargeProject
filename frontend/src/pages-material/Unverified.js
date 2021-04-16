import React from "react";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import Copyright from "./Copyright";

import { useStyles } from "../config";

export default function Verified({ handleThemeChange, darkState, title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} elevation={6}>
                <div className={classes.paper}>
                    <Card>
                        <CardContent>
                            <Grid
                                container
                                direction="column"
                                justify="center"
                                alignItems="center"
                            >
                                <Grid item xs={8}>
                                    <Avatar className={classes.avatar}>
                                        <LockOutlinedIcon />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography component="h5" variant="h5">
                                        Your Email is Still Unverified!!
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}>
                                    <br />
                                    <Typography
                                        component="body2"
                                        variant="h6"
                                    >
                                        Make sure to check the email you signed up with!!
                                    </Typography>
                                    <br/>
                                    <Typography
                                        component="body2"
                                        variant="2body"
                                    >
                                        If your verification link directed you here your code
                                        must have expired please{" "}
                                        <Link href="/login">sign in</Link> and
                                        request a new code.
                                    </Typography>
                                    {/* <Switch
                                            checked={darkState}
                                            onChange={handleThemeChange}
                                        /> */}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
                <Box mt={5}>
                    <Copyright />
                </Box>
            </Grid>
        </Grid>
    );
}
