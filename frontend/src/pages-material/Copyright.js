import React from "react";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { buildRedirectPath } from "../config";

export default function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © "}
            <Link color="inherit" href={buildRedirectPath("")}>
                Eventree
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}
