import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Copyright from "./Copyright";

import SideBar from "./profileBar.component";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";

import axios from "axios";
import Cookies from "js-cookie";
import { buildPath } from "../config";
import { useFormik } from "formik";
import * as yup from "yup";

import { useStylesProfile as useStyles } from "../config";

export default function ProfileDelete(darkState, handleThemeChange, title) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [user, setUser] = useState({});

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = async () => {
        if (Cookies.get("jwt") !== undefined) {
            const res = await axios.get(buildPath("api/user/info"), {
                withCredentials: true,
            });

            if (res.data.success) {
                setUser(res.data.user);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const [open, setOpen] = React.useState(false);
    const [wasSuccessful, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const handleSubmit = async (value) => {
        try {
            const res = await axios.post(
                buildPath("api/user/delete-account"),
                {
                    password: value.password,
                },
                { withCredentials: true }
            );

            console.log(res);

            if (res.data.success) {
                document.cookie =
                    "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
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
    };

    const handleSubmitThirdParty = async (event) => {
        event.preventDefault();

        try {
            const res = await axios.delete(
                buildPath("api/user/delete-account"),
                { withCredentials: true }
            );

            if (res.data.success) {
                document.cookie =
                    "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
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
    };

    const validationSchema = yup.object({
        password: yup
            .string("Enter your password")
            .min(8, "Password should be of minimum 8 characters length")
            .required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
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
            <Grid item xs={false} sm={4} md={12} className={classes.image} />
            <Grid xs={12} sm={8} md={12} elevation={6}>
                <div className={classes.paper}>
                    <Card>
                        <CardContent>
                            <Grid container justify="flex-end" spacing={2}>
                                <SideBar selected={"delete"} />
                                <Grid
                                    item
                                    xs={12}
                                    sm={8}
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Typography component="h1" variant="h5">
                                        Delete Account
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        Please input your password to confirm
                                        account deletion. (This action cannot be
                                        undone)
                                    </Typography>
                                    <form
                                        className={classes.form}
                                        noValidate
                                        onSubmit={
                                            user.googleId ||
                                            user.microsoftId ||
                                            user.githubId
                                                ? handleSubmitThirdParty
                                                : formik.handleSubmit
                                        }
                                    >
                                        <Grid
                                            container
                                            justify="flex-end"
                                            spacing={2}
                                        >
                                            {user.googleId ||
                                            user.microsoftId ||
                                            user.githubId ? (
                                                ""
                                            ) : (
                                                <Grid item xs={12}>
                                                    <TextField
                                                        variant="outlined"
                                                        margin="normal"
                                                        required
                                                        fullWidth
                                                        id="password"
                                                        name="password"
                                                        label="Password"
                                                        type="password"
                                                        value={
                                                            formik.values
                                                                .password
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
                                                            formik.errors
                                                                .password
                                                        }
                                                        autoComplete="current-password"
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>
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
                                        <br />

                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >
                                            Delete Account
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
