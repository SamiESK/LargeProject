import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import NaturePeopleIcon from "@material-ui/icons/NaturePeople";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export default function UserNavBar({ darkState, handleThemeChange, auth }) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="logo"
                        size="medium"
                        onClick={() => (window.location.href = "/")}
                    >
                        <NaturePeopleIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Eventree
                    </Typography>

                    <Tooltip title="Toggle light/dark Theme">
                        <Switch
                            checked={darkState}
                            onChange={handleThemeChange}
                        />
                    </Tooltip>
                    {darkState ? (
                        <Tooltip title="Enable Light Theme">
                            <IconButton
                                onClick={handleThemeChange}
                                color="inherit"
                            >
                                <Brightness7Icon fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Enable Dark Theme">
                            <IconButton
                                onClick={handleThemeChange}
                                color="inherit"
                            >
                                <Brightness4Icon fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {auth && (
                        <div>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle fontSize="large" />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem
                                    onClick={() =>
                                        (window.location.href = "/profile")
                                    }
                                >
                                    Profile
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        document.cookie =
                                            "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                        window.location.href = "/";
                                    }}
                                >
                                    Logout
                                </MenuItem>
                            </Menu>
                        </div>
                    )}
                    {!auth && (
                        <div>
                            <Button
                                aria-label="login"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={() =>
                                    (window.location.href = "/login")
                                }
                                color="inherit"
                            >
                                Sign in
                            </Button>
                        </div>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
}
