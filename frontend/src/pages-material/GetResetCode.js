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
import { buildPath, buildRedirectPath, useStyles } from "../config";

import Switch from "@material-ui/core/Switch";

export default function GetResetCode({ handleThemeChange, darkState, title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [wasSuccessful, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post(
                buildPath("api/user/password-reset/get-code"),
                {
                    email: values.email,
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = buildRedirectPath("password-reset");
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
    });

    const formik = useFormik({
        initialValues: {
            email: "",
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
                        Request Password Reset Code
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
                                <Link href="/password-reset" variant="body2">
                                    Already have a Code? Reset Password
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
