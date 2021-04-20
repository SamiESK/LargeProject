import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "js-cookie";
import axios from "axios";

// export const treeImageURL =  'https://source.unsplash.com/random?tree';
// export const treeImageURL = "https://source.unsplash.com/weekly?tree";
// export const treeImageURL = "https://source.unsplash.com/featured/?nature,tree";
// export const treeImageURL = "https://source.unsplash.com/featured/?tree";
export const treeImageURL = "https://source.unsplash.com/EPy0gBJzzZU/";

const app_name = "eventree-calendar";

export function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
        return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
        return "http://localhost:5000/" + route;
    }
}

export function buildRedirectPath(route) {
    if (process.env.NODE_ENV === "production") {
        return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
        return "http://localhost:3000/" + route;
    }
}

// this function is taken directly from https://usehooks.com/useLocalStorage/

// Hook
export function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

export const checkAuth = (auth) => {
    if (!auth) {
        // redirect user to login for authentication
        window.location.href = buildRedirectPath("");
    }
};

export const isAuthenticated = async () => {
    if (Cookies.get("jwt") !== undefined) {
        const res = await axios.get(buildPath("api/user/info"), {
            withCredentials: true,
        });

        if (res.status !== 401 && res.data.success) {
            return true;
        } else if (res.status === 401) {
            window.location.href = buildRedirectPath("login");
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const isVerified = async () => {
    if (Cookies.get("jwt") !== undefined) {
        const res = await axios.get(buildPath("api/user/info"), {
            withCredentials: true,
        });

        if (res.status !== 401 && res.data.success) {
            return res.data.user.isVerified;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const useStyles = makeStyles((theme) => ({
    root: {
        height: "100vh",
    },
    image: {
        backgroundImage: `url(${treeImageURL}})`,
        backgroundRepeat: "no-repeat",
        backgroundColor:
            theme.palette.type === "light"
                ? theme.palette.grey[50]
                : theme.palette.grey[900],
        backgroundSize: "cover",
        backgroundPosition: "center",
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export const useStylesProfile = makeStyles((theme) => ({
    root: {
        // height: "100vh",
    },
    image: {
        height: "100vh",
        backgroundImage: `url(${treeImageURL}})`,
        backgroundRepeat: "no-repeat",
        backgroundColor:
            theme.palette.type === "light"
                ? theme.palette.grey[50]
                : theme.palette.grey[900],
        backgroundSize: "cover",
        backgroundPosition: "center",
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "center",
        flexDirection: "column",
        alignItems: "center",
        position: "absolute",
        top: "5%",
        left: "15%",
        right: "15%",
    },

    calendar: {
        marginTop: theme.spacing(8),
        display: "center",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    root2: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },

    calendarBG: {
        backgroundColor:
            theme.palette.type === "light"
                ? theme.palette.grey[50]
                : theme.palette.grey[900],
    },

    calendarColor: {
        backgroundColor:
            theme.palette.type === "light"
                ? theme.palette.grey[50]
                : theme.palette.grey[400],
        padding: "1%",
    },
    textarea: {
        resize: "both",
        width: "100%",
    },

    center: {
        resize: "both",
        width: "100%",
    },
    headerLeft: {
        textAlign: "left",
        clear: "right",
    },
    headerRight: {
        textAlign: "right",
        clear: "left",
    },
    centerText: {
        alignItems: "center",
        width: "50%",
        left: "15%",
        right: "15%",
        margin: "0%",
    },
    centerPadding: {
        padding: "1%",
    },
    centerLoadingCircle: {
        margin: "2% 5%",
        width: "50%",

    },
}));
