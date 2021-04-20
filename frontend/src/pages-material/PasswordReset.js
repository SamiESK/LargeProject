import React from "react";
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

import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";

import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { buildPath, buildRedirectPath } from "../config";

import Switch from "@material-ui/core/Switch";

import { useStyles } from "../config";

export default function PasswordReset({ handleThemeChange, darkState, title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [wasSuccessful, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post(
                buildPath("api/user/password-reset/verify"),
                {
                    code: values.code,
                    email: values.email,
                    password: values.password,
                    repeat_password: values.repeat_password,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("login");
            } else {
                setOpen(true);
                setMsg("An Error Occurred");
                setSuccess(false);
            }
        } catch (err) {
            console.error(err);
            setOpen(true);
            setMsg("An Error Occurred");
            setSuccess(false);
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
                "This Email is not associated with an account",
                function (value) {
                    return new Promise((resolve, reject) => {
                        axios
                            .get(buildPath("api/user/email-exists"), {
                                params: { email: value },
                            })
                            .then((res) => {
                                // exists
                                if (res.data.emailExists) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            })
                            .catch(() => {
                                // note exists
                                resolve(false);
                            });
                    });
                }
            )
            .required("Email is required"),
        password: yup
            .string("Enter your new password")
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
            .required("Confirmation of New Password is required"),
        code: yup
            .string("Enter your Last name")
            .test(
                "len",
                "Code must be exactly 10 characters long",
                (val) => val.length === 10
            )
            .required("Code is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            repeat_password: "",
            code: "",
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
                        Reset Password
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={formik.handleSubmit}
                    >
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="code"
                                    label="Reset Code"
                                    name="code"
                                    autoComplete="code"
                                    value={formik.values.code}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.code &&
                                        Boolean(formik.errors.code)
                                    }
                                    helperText={
                                        formik.touched.code &&
                                        formik.errors.code
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
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
                                />
                            </Grid>
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
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="repeat_password"
                                    label="Confirm Password"
                                    type="password"
                                    autoComplete="current-password"
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
                            Reset Password
                        </Button>
                        <Collapse in={open}>
                            <Alert
                                severity={wasSuccessful ? "success" : "error"}
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
                        <Grid container justify="flex-end">
                            <Grid item>
                                <Link href="/get-reset-code" variant="body2">
                                    Need a Code? Request Code
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
