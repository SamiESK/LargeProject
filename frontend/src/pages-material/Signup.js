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
import Switch from "@material-ui/core/Switch";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import { useFormik } from "formik";
import * as yup from "yup";

import Copyright from "./Copyright";
import axios from "axios";
import { buildPath, buildRedirectPath, useStyles } from "../config";

export default function SignUp({ handleThemeChange, darkState, title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post(
                buildPath("api/user/register"),
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password,
                    repeat_password: values.repeat_password,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("unverified");
            } else {
                // display error
                setOpen(true);
                setMsg("An Error Occurred");
            }
        } catch (err) {
            console.error(err);
            setOpen(true);
            setMsg("An Error Occurred");
        }

        // alert(`${email} ${password}, ${e.target.email.value} ${e.target.password.value}`);
    };

    const validationSchema = yup.object({
        email: yup
            .string("Enter your email")
            .min(5, "Email should be of minimum 5 characters length")
            .email("Enter a valid email")
            .test(
                "checkDuplicateEmail",
                "Email already in use",
                function (value) {
                    return new Promise((resolve, reject) => {
                        axios
                            .get(buildPath("api/user/email-exists"), {
                                params: { email: value },
                            })
                            .then((res) => {
                                // exists
                                if (res.data.emailExists) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            })
                            .catch(() => {
                                // note exists
                                resolve(true);
                            });
                    });
                }
            )
            .required("Email is required"),
        password: yup
            .string("Enter your password")
            .min(8, "Password should be of minimum 8 characters length")
            .test(
                "validCharacters",
                "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
                (value) =>
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/.test(
                        value
                    )
            )
            .required("Password is required"),
        repeat_password: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match")
            .required("Confirmation of Password is required"),
        firstName: yup
            .string("Enter your First name")
            .min(1, "First name should be of minimum 1 character length")
            .required("First name is required"),
        lastName: yup
            .string("Enter your Last name")
            .min(1, "Last name should be of minimum 1 character length")
            .required("Last name is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            repeat_password: "",
            lastName: "",
            firstName: "",
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
                        Sign up
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={formik.handleSubmit}
                    >
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="fname"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.firstName &&
                                        Boolean(formik.errors.firstName)
                                    }
                                    helperText={
                                        formik.touched.firstName &&
                                        formik.errors.firstName
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lname"
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.lastName &&
                                        Boolean(formik.errors.lastName)
                                    }
                                    helperText={
                                        formik.touched.lastName &&
                                        formik.errors.lastName
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
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
                                        formik.touched.email &&
                                        formik.errors.email
                                    }
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
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
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="password2"
                                    name="repeat_password"
                                    label="Confirm Password"
                                    type="password"
                                    value={formik.values.repeat_password}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.repeat_password &&
                                        Boolean(formik.errors.repeat_password)
                                    }
                                    helperText={
                                        formik.touched.repeat_password &&
                                        formik.errors.repeat_password
                                    }
                                    autoComplete="current-password"
                                />
                            </Grid>
                        </Grid>
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
                        <br />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            // disabled={!(formik.dirty && formik.isValid)}
                        >
                            Sign Up
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                                {/* <Switch
                                    checked={darkState}
                                    onChange={handleThemeChange}
                                /> */}
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
