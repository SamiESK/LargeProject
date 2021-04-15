import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";

import axios from "axios";
import { buildPath, buildRedirectPath, useStyles } from "../config";

import Switch from "@material-ui/core/Switch";

export default function GetResetCode({ handleThemeChange, darkState }) {
    const classes = useStyles();

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                buildPath("api/user/password-reset/get-code"),
                {
                    email: email,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("password-reset");
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
                        Request Password Reset Code
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit}
                    >
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Get Code
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="/password-reset" variant="body2">
                                    Already have a Code? Reset Password
                                </Link>
                                <Switch
                                    checked={darkState}
                                    onChange={handleThemeChange}
                                />
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}
