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
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import { buildPath, buildRedirectPath } from "../config";
import Copyright from "./Copyright";
import { useFormik } from "formik";
import * as yup from "yup";

import {
    GoogleLoginButton,
    MicrosoftLoginButton,
    GithubLoginButton,
} from "react-social-login-buttons";

import { useStyles } from "../config";

function SignInSide({ handleThemeChange, darkState, title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post(
                buildPath("api/user/login"),
                {
                    email: values.email,
                    password: values.password,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("calendar");
            } else {
                // display error
                setOpen(true);
                setMsg(res.data.error);
            }
        } catch (err) {
            console.error(err);
            setOpen(true);
            setMsg(err.response.data.error);
        }
    };

    const validationSchema = yup.object({
        email: yup
            .string("Enter your email")
            .min(5, "Email should be of minimum 5 characters length")
            .email("Enter a valid email")
            .required("Email is required"),
        password: yup
            .string("Enter your password")
            .min(8, "Password should be of minimum 8 characters length")
            .required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

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
                        onSubmit={formik.handleSubmit}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.email &&
                                Boolean(formik.errors.email)
                            }
                            helperText={
                                formik.touched.email && formik.errors.email
                            }
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.password &&
                                Boolean(formik.errors.password)
                            }
                            helperText={
                                formik.touched.password &&
                                formik.errors.password
                            }
                            autoComplete="current-password"
                        />
                        <Collapse in={open}>
                            <Alert
                                severity={"error"}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {msg}
                            </Alert>
                        </Collapse>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            // disabled={!(formik.dirty && formik.isValid)}
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
                    </form>
                    <GoogleLoginButton
                        onClick={() =>
                            (window.location.href = buildPath("auth/google"))
                        }
                    />
                    <MicrosoftLoginButton
                        onClick={() =>
                            (window.location.href = buildPath("auth/microsoft"))
                        }
                    />
                    <GithubLoginButton
                        onClick={() =>
                            (window.location.href = buildPath("auth/github"))
                        }
                    />
                    <Box mt={5}>
                        <Copyright />
                    </Box>
                </div>
            </Grid>
        </Grid>
    );
}

export default SignInSide;
