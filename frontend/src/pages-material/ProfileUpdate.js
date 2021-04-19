import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import SideBar from "./profileBar.component";
import axios from "axios";
import Cookies from "js-cookie";
import { buildPath, useLocalStorage } from "../config";
import { useFormik } from "formik";
import * as yup from "yup";

import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";

import { useStylesProfile as useStyles } from "../config";
import { required } from "joi";

export default function ProfileUpdate(darkState, handleThemeChange, title) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [auth, setAuth] = useLocalStorage("auth", false);

    useEffect(() => {
        getInfo(auth);
    }, [auth]);

    const [open, setOpen] = React.useState(false);
    const [wasSuccessful, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState("");

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
                            .get(buildPath("api/user/email-exists-auth"), {
                                params: { email: value },
                                withCredentials: true,
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
            ),
        old_password: yup
            .string("Enter your password")
            .min(8, "Password should be of minimum 8 characters length")
            .test(
                "hasOldPassword",
                "Your current password is required",
                (value) => {
                    if (Boolean(formik.values.password) && !Boolean(value)) {
                        return false;
                    }
                    return true;
                }
            )
            .transform((value) => (!value ? undefined : value)),
        password: yup
            .string("Enter your new password")
            .min(8, "Password should be of minimum 8 characters length")
            .transform((value) => (!value ? undefined : value))
            .test(
                "validCharacters",
                "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
                (value) => {
                    return (
                        value === "" ||
                        value === undefined ||
                        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/.test(
                            value
                        )
                    );
                }
            ),
        repeat_password: yup
            .string()
            .oneOf([yup.ref("password"), null], "Passwords must match")
            .test("passwordsMatch", "Passwords must match", (value) => {
                return formik.values.repeat_password === formik.values.password;
            }),
        firstName: yup
            .string("Enter your First name")
            .min(1, "First name should be of minimum 1 character length"),
        lastName: yup
            .string("Enter your Last name")
            .min(1, "Last name should be of minimum 1 character length"),
    });

    const handleSubmit = async (values) => {
        try {
            let update = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
            };

            if (
                values.password !== "" &&
                values.password !== undefined &&
                values.repeat_password !== "" &&
                values.repeat_password !== undefined &&
                values.old_password !== "" &&
                values.old_password !== undefined
            ) {
                update.password = values.password;
                update.repeat_password = values.repeat_password;
                update.old_password = values.old_password;
            }

            const res = await axios.patch(
                buildPath("api/user/update"),
                update,
                { withCredentials: true }
            );

            if (res.data.success) {
                formik.setFieldValue("password", "");
                formik.setFieldValue("old_password", "");
                formik.setFieldValue("repeat_password", "");
                getInfo();
                setOpen(true);
                setMsg("Profile was successfully updated!");
                setSuccess(true);
                // document.location.reload();
            } else {
                setOpen(true);
                setMsg(res.data.error);
                setSuccess(false);
            }
        } catch (err) {
            console.error(err);
            setOpen(true);
            setMsg("An Error Occurred");
            setSuccess(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            old_password: "",
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

    const getInfo = async () => {
        if (Cookies.get("jwt") !== undefined) {
            const res = await axios.get(buildPath("api/user/info"), {
                withCredentials: true,
            });

            if (res.data.success) {
                formik.setFieldValue("firstName", res.data.user.firstName);
                formik.setFieldValue("lastName", res.data.user.lastName);
                formik.setFieldValue("email", res.data.user.email);
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
                                <SideBar selected={"update"} />
                                <Grid
                                    item
                                    xs={12}
                                    sm={8}
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Typography component="h1" variant="h5">
                                        Update Information
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        You can change your information with the
                                        following fields
                                    </Typography>
                                    <form
                                        className={classes.form}
                                        noValidate
                                        onSubmit={formik.handleSubmit}
                                    >
                                        <Grid
                                            container
                                            justify="flex-end"
                                            spacing={2}
                                        >
                                            <Grid item xs={12}>
                                                <TextField
                                                    autoComplete="fname"
                                                    name="firstName"
                                                    variant="outlined"
                                                    fullWidth
                                                    id="firstName"
                                                    label="First Name"
                                                    autoFocus
                                                    value={
                                                        formik.values.firstName
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched
                                                            .firstName &&
                                                        Boolean(
                                                            formik.errors
                                                                .firstName
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched
                                                            .firstName &&
                                                        formik.errors.firstName
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="lastName"
                                                    label="Last Name"
                                                    name="lastName"
                                                    autoComplete="lname"
                                                    value={
                                                        formik.values.lastName
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched
                                                            .lastName &&
                                                        Boolean(
                                                            formik.errors
                                                                .lastName
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched
                                                            .lastName &&
                                                        formik.errors.lastName
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="email"
                                                    name="email"
                                                    label="Email"
                                                    value={formik.values.email}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched.email &&
                                                        Boolean(
                                                            formik.errors.email
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched.email &&
                                                        formik.errors.email
                                                    }
                                                    autoComplete="email"
                                                />
                                            </Grid>
                                            <br />
                                            <Grid item xs={12}>
                                                <Typography
                                                    component="h1"
                                                    variant="body2"
                                                    align="left"
                                                >
                                                    You can change your password
                                                    below
                                                </Typography>
                                                <br />
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="old_password"
                                                    name="old_password"
                                                    label="Password"
                                                    type="password"
                                                    value={
                                                        formik.values
                                                            .old_password
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched
                                                            .old_password &&
                                                        Boolean(
                                                            formik.errors
                                                                .old_password
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched
                                                            .old_password &&
                                                        formik.errors
                                                            .old_password
                                                    }
                                                    autoComplete="current-password"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="password"
                                                    name="password"
                                                    label="New Password"
                                                    type="password"
                                                    value={
                                                        formik.values.password
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched
                                                            .password &&
                                                        Boolean(
                                                            formik.errors
                                                                .password
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched
                                                            .password &&
                                                        formik.errors.password
                                                    }
                                                    autoComplete="current-password"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    variant="outlined"
                                                    fullWidth
                                                    id="password2"
                                                    name="repeat_password"
                                                    label="Confirm New Password"
                                                    type="password"
                                                    value={
                                                        formik.values
                                                            .repeat_password
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    error={
                                                        formik.touched
                                                            .repeat_password &&
                                                        Boolean(
                                                            formik.errors
                                                                .repeat_password
                                                        )
                                                    }
                                                    helperText={
                                                        formik.touched
                                                            .repeat_password &&
                                                        formik.errors
                                                            .repeat_password
                                                    }
                                                    autoComplete="current-password"
                                                />
                                            </Grid>
                                        </Grid>
                                        <br />
                                        <Collapse in={open}>
                                            <Alert
                                                severity={
                                                    wasSuccessful
                                                        ? "success"
                                                        : "error"
                                                }
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
                                            // disabled={
                                            //     !(
                                            //         formik.dirty &&
                                            //         formik.isValid
                                            //     )
                                            // }
                                        >
                                            Update
                                        </Button>
                                        <Box mt={5}>
                                            <Copyright />
                                        </Box>
                                    </form>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
            </Grid>
        </Grid>
    );
}
