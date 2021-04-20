import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
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

import Cookies from "js-cookie";
import axios from "axios";
import { buildPath, useStyles, isVerified } from "../config";

export default function GetVerificationCode({ title }) {
    document.title = title ? title : document.title;
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [wasSuccessful, setSuccess] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const [user, setUser] = React.useState({});

    React.useEffect(() => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.get(
                buildPath("api/user/verification/get-activation-email"),
                { withCredentials: true }
            );

            if (res.data.success) {
                setOpen(true);
                setMsg("The Email was sent successfully");
                setSuccess(true);
            } else {
                setOpen(true);
                setMsg("An Error Occurred");
                setSuccess(false);
            }
        } catch (err) {
            console.error(err);
        }
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
                        Request New Verification Email
                    </Typography>
                    {user.email && (
                        <Typography component="h6" variant="body2">
                            This email will be sent to {user.email}
                        </Typography>
                    )}
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit}
                    >
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Request Email
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
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}
