import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import { Link as LinkTo } from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';

export default function SideBar({ selected }) {
    return (
        <Grid item xs={12} sm={4}>
            <List component="nav" aria-label="main mailbox folders">
                <ListItem button component={LinkTo} to="/calendar">
                    <ListItemIcon>
                        <ArrowBackIcon />
                    </ListItemIcon>
                    <ListItemText primary="Back to Calendar" />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "home"}
                    component={LinkTo}
                    to="/profile"
                >
                    <ListItemIcon>
                        <InfoIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "update"}
                    component={LinkTo}
                    to="/profile/update"
                >
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Update Profile" />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "delete"}
                    component={LinkTo}
                    to="/profile/delete"
                >
                    <ListItemIcon>
                        <DeleteForeverIcon />
                    </ListItemIcon>
                    <ListItemText primary="Delete Account" />
                </ListItem>
            </List>
        </Grid>
    );
}
