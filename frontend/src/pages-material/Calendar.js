import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useRef, useCallback } from "react";
import DateTimePicker from "react-datetime-picker";
import { withStyles } from "@material-ui/core/styles";

import Container from "@material-ui/core/Container";

import { useState } from "react";

import axios from "axios";
import { buildPath } from "../config";

import useEventsSearch from "./useEventsSearch";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import Copyright from "./Copyright";

import { useStylesProfile as useStyles } from "../config";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

var ID;
var loadEvents;
var newEndEdit;

function CalendarDisplay() {
    const classes = useStyles();

    const [title, setTitle] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [id, setID] = useState("");

    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setOffset(0);
        setLimit(10);
    };

    const handleSearchChangeStr = (search) => {
        setSearch(search);
        setOffset(0);
        setLimit(10);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };
    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };
    const handleStartChange = (event) => {
        setStart(event);
    };
    const handleEndChange = (event) => {
        setEnd(event);
    };

    const [openAdd, setAddOpen] = React.useState(false);

    const handleClickOpenAdd = () => {
        setAddOpen(true);
    };

    const handleCloseAdd = () => {
        setAddOpen(false);
    };

    const [openEdit, setEditOpen] = React.useState(false);

    const handleClickOpenEdit = () => {
        setEditOpen(true);
    };

    const handleCloseEdit = () => {
        setEditOpen(false);
    };

    const [openRead, setReadOpen] = React.useState(false);

    const handleClickOpenRead = () => {
        setReadOpen(true);
    };

    const handleCloseRead = () => {
        setReadOpen(false);
    };

    const [openRemove, setRemoveOpen] = React.useState(false);

    const handleClickOpenRemove = () => {
        setRemoveOpen(true);
    };

    const handleCloseRemove = () => {
        setRemoveOpen(false);
    };

    const [myEventsList, setevent] = useState([]);
    const temp = [];

    const EventInfo = (e) => {
        handleClickOpenRead();
        setDescription(e.description);
        setLocation(e.location);
        setTitle(e.title);
        setStart(e.start);
        setEnd(e.end);
        setID(e.id);
    };


    const LoadEvent = (e) => {
        setDescription(e.description);
        setLocation(e.location);
        setTitle(e.title);
        setStart(e.startTime);
        setEnd(e.endTime);
        setID(e._id);
    };

    const removeEvent = async (event) => {
        event.preventDefault();

        try {
            let res = await axios.delete(buildPath(`api/events/remove/${id}`), {
                withCredentials: true,
            });

            if (res.data.success) {
                loadEvents();
                handleSearchChangeStr(search);
                handleCloseRemove();
            } else {
                // error
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addEvent = async (event) => {
        let defaultendDate;

        event.preventDefault();

        if (!end) defaultendDate = start;
        else defaultendDate = end;

        let obj = {
            title: title,
            description: description,
            location: location,
            startTime: start,
            endTime: defaultendDate,
        };

        try {
            let res = await axios.post(buildPath("api/events/create"), obj, {
                withCredentials: true,
            });

            if (res.data.success) {
                loadEvents();
                handleCloseAdd();
            } else {
                // error
            }
        } catch (e) {
            console.error(e.toString());
        }
    };

    const editEvent = async (event) => {
        event.preventDefault();
        if (!end) newEndEdit = start;
        else newEndEdit = end;

        let obj = {
            title: title,
            description: description,
            location: location,
            startTime: start,
            endTime: newEndEdit,
        };

        try {
            let res = await axios.patch(
                buildPath("api/events/update/" + String(id)),
                obj,
                { withCredentials: true }
            );

            if (res.data.success) {
                loadEvents();
                handleSearchChangeStr(search);
                handleCloseEdit();
            } else {
                // error
            }
        } catch (e) {
            console.error(e.toString());
        }
    };

    window.onload = loadEvents = async () => {
        //console.log(obj);

        try {
            let res = await axios.get(buildPath("api/events"), {
                withCredentials: true,
            });

            res = res.data;

            var Event;
            myEventsList.length = 0;
            temp.length = 0;
            //var res = JSON.parse(await response.text());
            for (var i = 0; i < res.length; i++) {
                Event = {
                    title: res[i].title,
                    description: res[i].description,
                    location: res[i].location,
                    start: new Date(res[i].startTime),
                    end: new Date(res[i].endTime),
                    allDay: false,
                    id: res[i]._id,
                };
                temp.push(Event);
            }
            setevent(temp);
        } catch (e) {
            console.error(e.toString());
        }
    };

    const StyledTextField = withStyles((theme) => ({
        root: {
            margin: theme.spacing(2),
            width: 300,
            "& .MuiInput-underline": {
                color: theme.palette.primary.main,
                height: 60,
                "& input": {
                    textAlign: "right",
                },
            },
            "& .MuiFormLabel-root": {
                color: theme.palette.secondary.main,
            },
        },
    }))(TextField);

    const { loading, events, hasMore, error } = useEventsSearch(
        search,
        limit,
        offset
    );

    const observer = useRef();
    const lastEventRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setOffset((prevOffset) => prevOffset + limit);
            }
        });
        if (node) observer.current.observe(node);
    });

    function EventCard({ event }) {
        return (
            <div>
                <Card>

                    <CardContent>
                    <Typography color="textSecondary" variant='h4' gutterBottom>
                    <TextField

                                            margin="dense"
                                            id="name"
                                            label="Title"
                                            type="text"
                                            defaultValue={event.title}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />


                    </Typography>
                    <Typography color="textSecondary" variant='h5' gutterBottom>
                    <TextField

                                            margin="dense"
                                            id="name"
                                            label="Location"
                                            type="text"
                                            defaultValue={event.location}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                    </Typography>
                    <Typography color="textSecondary" variant='body2' gutterBottom>
                    <TextField

                                            margin="dense"
                                            id="name"
                                            label="Description"
                                            type="text"
                                            defaultValue={event.description}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                    </Typography>
                    <Typography color="textSecondary" variant='body2' gutterBottom>
                    <TextField

                                            margin="dense"
                                            id="name"
                                            label="Start Time"
                                            type="text"
                                            defaultValue={event.startTime}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                    </Typography>
                    <Typography color="textSecondary" variant='body2' gutterBottom>
                    <TextField

                                            margin="dense"
                                            id="name"
                                            label="End Time"
                                            type="text"
                                            defaultValue={event.endTime}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                    </Typography>
                    <Button
                        onClick={() => {
                            LoadEvent(event);
                            handleClickOpenRemove();
                        }}
                        color="primary"
                    >
                        Delete <EditIcon />
                    </Button>
                    <Button
                        onClick={() => {
                            LoadEvent(event);
                            handleClickOpenEdit();
                        }}
                        color="primary"
                    >
                        Edit <DeleteIcon />
                    </Button>
                    </CardContent>
                </Card>
                <br/>
            </div>
        );
    }

    return (
        <div>
            <div className={classes.calendar} className={classes.calendarBG}>
                <Container className="border p-10" id="homeBack">
                    <Container className="border p-10" id="callyContainer">
                        <div id="cally" className={classes.calendarColor}>
                            <div className={classes.headerRight}>
                                <div className={classes.headerLeft}>
                                    <br />
                                    <Typography variant="h3">
                                        Calendar{" "}
                                    </Typography>
                                </div>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleClickOpenAdd}
                                >
                                    Add Event <AddIcon />
                                </Button>
                            </div>

                            <br />

                            <Calendar
                                localizer={localizer}
                                events={myEventsList}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 1000 }}
                                views={["month", "week"]}
                                onSelectEvent={(event) => {
                                    EventInfo(event);
                                }}
                            />
                        </div>
                    </Container>
                </Container>

                <Container className={classes.centerText}>
                    <TextField
                        margin="dense"
                        id="searchField"
                        label="Search Events"
                        onChange={handleSearchChange}
                        fullWidth
                        value={search}
                        type="text"
                    />
                    {events.map((event, index) => {
                        if (events.length === index + 1) {
                            return (
                                <div ref={lastEventRef} key={event._id}>
                                    <EventCard event={event} />
                                </div>
                            );
                        } else {
                            return (
                                <div key={event._id}>
                                    <EventCard event={event} />
                                </div>
                            );
                        }
                    })}
                    <div>{loading && "Loading...."}</div>
                    <div>{error && "An Error Occurred"}</div>
                </Container>
                <Copyright />
            </div>

            <div>
                <Dialog
                    open={openAdd}
                    onClose={handleCloseAdd}
                    aria-labelledby="form-dialog-title"
                >
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={addEvent}
                    >
                        <DialogTitle id="form-dialog-title">
                            Add Event
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                To add an event you must fill out the required
                                fields below.
                            </DialogContentText>
                            <Grid container justify="flex-end" spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Title"
                                        type="email"
                                        value={title}
                                        onChange={handleTitleChange}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Location"
                                        type="email"
                                        value={location}
                                        onChange={handleLocationChange}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextareaAutosize
                                        aria-label="minimum height"
                                        rowsMin={5}
                                        placeholder="Description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                        className={classes.textarea}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <label>Start Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        value={start}
                                        onChange={handleStartChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <label>End Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        value={end}
                                        onChange={handleEndChange}
                                    />
                                </Grid>

                                <p>
                                    <b>
                                        *Leave End Time blank to default to
                                        start time
                                    </b>
                                </p>
                            </Grid>
                            <br />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseAdd} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Add <AddIcon />
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>

            <div>
                <Dialog
                    open={openEdit}
                    onClose={handleCloseEdit}
                    aria-labelledby="form-dialog-title"
                >
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={editEvent}
                    >
                        <DialogTitle id="form-dialog-title">
                            Edit Event
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Make the changes you want using the fields
                                below!
                            </DialogContentText>
                            <Grid container justify="flex-end" spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Title"
                                        type="email"
                                        value={title}
                                        onChange={handleTitleChange}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Location"
                                        type="email"
                                        value={location}
                                        onChange={handleLocationChange}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextareaAutosize
                                        aria-label="minimum height"
                                        rowsMin={5}
                                        placeholder="Description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                        className={classes.textarea}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <label>Start Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        value={start}
                                        onChange={handleStartChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <label>End Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        value={end}
                                        onChange={handleEndChange}
                                    />
                                </Grid>
                            </Grid>
                            <br />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEdit} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Edit <EditIcon />
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>

            <div>
                <Dialog
                    open={openRead}
                    onClose={handleCloseRead}
                    aria-labelledby="form-dialog-title"
                >
                    <form
                        className={classes.form}
                        noValidate
                        // onSubmit={}
                    >
                        <DialogTitle id="form-dialog-title">
                            {title}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <Grid container justify="flex-end" spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField

                                            margin="dense"
                                            id="name"
                                            label="Location"
                                            type="email"
                                            defaultValue={location}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField

                                            margin="dense"
                                            id="name"
                                            label="Description"
                                            type="email"
                                            defaultValue={description}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField

                                            margin="dense"
                                            id="name"
                                            label="Start Time"
                                            type="email"
                                            defaultValue={start}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField

                                            margin="dense"
                                            id="name"
                                            label="End Time"
                                            type="email"
                                            defaultValue={end}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseRead} color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    handleCloseRead();
                                    handleClickOpenRemove();
                                }}
                                color="primary"
                            >
                                Delete <EditIcon />
                            </Button>
                            <Button
                                onClick={() => {
                                    handleCloseRead();
                                    handleClickOpenEdit();
                                }}
                                color="primary"
                            >
                                Edit <DeleteIcon />
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>

            <div>
                <Dialog
                    open={openRemove}
                    onClose={handleCloseRemove}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{`Are you sure you wan to delete ${title} from your calendar?`}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            This operation cannot be undone
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseRemove} color="primary">
                            Disagree
                        </Button>
                        <Button onClick={removeEvent} color="primary" autoFocus>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}
export default CalendarDisplay;
