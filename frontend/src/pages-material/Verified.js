import React from "react";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

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
                                <Grid item xs={12}>
                                    <Avatar className={classes.avatar}>
                                        <LockOutlinedIcon />
                                    </Avatar>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h5"
                                        color="textSecondary"
                                        component="h3"
                                    >
                                        Hooray! Your Email has been Verified!
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Link href="/login" variant="h6">
                                        Login Here!
                                    </Link>
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
