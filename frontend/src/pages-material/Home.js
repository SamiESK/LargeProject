import React from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { useStylesProfile as useStyles } from "../config";

export default function Home({ title }) {
    document.title = title ? title : document.title;
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
                                    fulfill your scheduling needs.
                                </Typography>

                                <br />
                                <Typography component="h1" variant="body2">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                        onClick={() =>
                                            (window.location.href = "/signup")
                                        }
                                    >
                                        Sign up
                                    </Button>{" "}
                                    or{" "}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                        onClick={() =>
                                            (window.location.href = "/login")
                                        }
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
