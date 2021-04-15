import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useRef, useCallback, useEffect } from "react";
import DateTimePicker from "react-datetime-picker";

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
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import { useFormik } from "formik";
import * as yup from "yup";

import Copyright from "./Copyright";

import { useStylesProfile as useStyles } from "../config";
import FormHelperText from "@material-ui/core/FormHelperText";

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

        formikEdit.setFieldValue("description", e.description);
        formikEdit.setFieldValue("location", e.location);
        formikEdit.setFieldValue("title", e.title);
        formikEdit.setFieldValue("startTime", new Date(e.start));
        formikEdit.setFieldValue("endTime", new Date(e.end));
        setID(e.id);
    };

    const LoadEvent = (e) => {
        formikEdit.setFieldValue("description", e.description);
        formikEdit.setFieldValue("location", e.location);
        formikEdit.setFieldValue("title", e.title);
        formikEdit.setFieldValue("startTime", new Date(e.startTime));
        formikEdit.setFieldValue("endTime", new Date(e.endTime));
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

    const addEvent = async (value) => {
        let defaultendDate;

        const end = value.endTime;
        const start = value.startTime;

        if (!end) defaultendDate = start;
        else defaultendDate = end;

        let obj = {
            title: value.title,
            description: value.description,
            location: value.location,
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

    const editEvent = async (value) => {
        const end = value.endTime;
        const start = value.startTime;

        if (!end) newEndEdit = start;
        else newEndEdit = end;

        let obj = {
            title: value.title,
            description: value.description,
            location: value.location,
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

    const loadEvents = async () => {
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

    useEffect(() => {
        loadEvents();

        const interval = setInterval(() => {
            loadEvents();
        }, 6000); // 60 seconds

        return () => clearInterval(interval);
    }, []);

    const validationEventSchema = yup.object({
        title: yup
            .string("Enter a title for this event")
            .min(1, "Title should be of minimum 1 characters length")
            .required("Title is required"),
        location: yup
            .string("Enter the location this event is taking place at")
            .min(1, "Location should be of minimum 1 characters length"),
        description: yup
            .string("Enter some information about this event")
            .min(1, "description should be of minimum 1 characters length"),
        startTime: yup.date().required("This event must take place some time"),
        endTime: yup
            .date()
            .min(yup.ref("startTime"), "end date can't be before start date"),
    });

    const handleFormikDateAddStart = (date) => {
        formikAdd.setFieldValue("startTime", new Date(date));
    };

    const handleFormikDateAddEnd = (date) => {
        formikAdd.setFieldValue("endTime", new Date(date));
    };

    const handleFormikDateEditStart = (date) => {
        formikEdit.setFieldValue("startTime", new Date(date));
    };

    const handleFormikDateEditEnd = (date) => {
        formikEdit.setFieldValue("endTime", new Date(date));
    };

    const formikAdd = useFormik({
        initialValues: {
            title: "",
            location: "",
            description: "",
            startTime: new Date(),
            endTime: new Date(),
        },
        validationSchema: validationEventSchema,
        onSubmit: (values) => {
            addEvent(values);
        },
    });

    const formikEdit = useFormik({
        initialValues: {
            title: "",
            location: "",
            description: "",
            startTime: new Date(),
            endTime: new Date(),
        },
        validationSchema: validationEventSchema,
        onSubmit: (values) => {
            editEvent(values);
        },
    });

    function EventCard({ event }) {
        return (
            <div>
                <Card>
                    <CardActionArea className={classes.centerPadding}>
                        <Typography
                            color="textSecondary"
                            variant="h4"
                            gutterBottom
                        >
                            <TextField
                                margin="dense"
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
                        <Typography
                            color="textSecondary"
                            variant="h5"
                            gutterBottom
                        >
                            <TextField
                                margin="dense"
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
                        <Typography
                            color="textSecondary"
                            variant="body2"
                            gutterBottom
                        >
                            <TextField
                                margin="dense"
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
                        <Typography
                            color="textSecondary"
                            variant="body2"
                            gutterBottom
                        >
                            <TextField
                                margin="dense"
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
                        <Typography
                            color="textSecondary"
                            variant="body2"
                            gutterBottom
                        >
                            <TextField
                                margin="dense"
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
                    </CardActionArea>
                    <CardActions>
                        <Button
                            onClick={() => {
                                LoadEvent(event);
                                handleClickOpenRead();
                            }}
                            color="primary"
                        >
                            Open
                        </Button>
                        <Button
                            onClick={() => {
                                LoadEvent(event);
                                handleClickOpenRemove();
                            }}
                            color="primary"
                        >
                            Delete <DeleteIcon />
                        </Button>
                        <Button
                            onClick={() => {
                                LoadEvent(event);
                                handleClickOpenEdit();
                            }}
                            color="primary"
                        >
                            Edit <EditIcon />
                        </Button>
                    </CardActions>
                </Card>
                <br />
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

                        <Container className={classes.centerStuff}>
                            <div>
                                <TextField
                                    margin="dense"
                                    id="searchField"
                                    label="Search Events"
                                    onChange={handleSearchChange}
                                    fullWidth
                                    value={search}
                                    type="text"
                                />
                                <br />
                                <br />
                                {events.map((event, index) => {
                                    if (events.length === index + 1) {
                                        return (
                                            <div
                                                ref={lastEventRef}
                                                key={event._id}
                                            >
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
                            </div>
                        </Container>
                    </Container>
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
                        onSubmit={formikAdd.handleSubmit}
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
                                        name="title"
                                        label="Title"
                                        type="text"
                                        fullWidth
                                        value={formikAdd.values.title}
                                        onChange={formikAdd.handleChange}
                                        error={
                                            formikAdd.touched.title &&
                                            Boolean(formikAdd.errors.title)
                                        }
                                        helperText={
                                            formikAdd.touched.title &&
                                            formikAdd.errors.title
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name="location"
                                        label="Location"
                                        type="text"
                                        fullWidth
                                        value={formikAdd.values.location}
                                        onChange={formikAdd.handleChange}
                                        error={
                                            formikAdd.touched.location &&
                                            Boolean(formikAdd.errors.location)
                                        }
                                        helperText={
                                            formikAdd.touched.location &&
                                            formikAdd.errors.location
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextareaAutosize
                                        className={classes.textarea}
                                        aria-label="minimum height"
                                        rowsMin={5}
                                        placeholder="Description"
                                        name="description"
                                        type="text"
                                        label="description"
                                        value={formikAdd.values.description}
                                        onChange={formikAdd.handleChange}
                                    />
                                    <FormHelperText
                                        error={
                                            formikAdd.touched.description &&
                                            Boolean(
                                                formikAdd.errors.description
                                            )
                                        }
                                    >
                                        {formikAdd.touched.description &&
                                            formikAdd.errors.description}
                                    </FormHelperText>
                                </Grid>

                                <Grid item xs={12}>
                                    <label>Start Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        name="startTime"
                                        value={formikAdd.values.startTime}
                                        onChange={handleFormikDateAddStart}
                                    />
                                    <FormHelperText
                                        error={
                                            formikAdd.touched.startTime &&
                                            Boolean(formikAdd.errors.startTime)
                                        }
                                    >
                                        {formikAdd.touched.startTime &&
                                            formikAdd.errors.startTime}
                                    </FormHelperText>
                                </Grid>

                                <Grid item xs={12}>
                                    <label>End Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        name="endTime"
                                        value={formikAdd.values.endTime}
                                        onChange={handleFormikDateAddEnd}
                                    />
                                    <FormHelperText
                                        error={
                                            formikAdd.touched.endTime &&
                                            Boolean(formikAdd.errors.endTime)
                                        }
                                    >
                                        {formikAdd.touched.endTime &&
                                            formikAdd.errors.endTime}
                                    </FormHelperText>
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
                        onSubmit={formikEdit.handleSubmit}
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
                                        name="title"
                                        label="Title"
                                        type="text"
                                        fullWidth
                                        value={formikEdit.values.title}
                                        onChange={formikEdit.handleChange}
                                        error={
                                            formikEdit.touched.title &&
                                            Boolean(formikEdit.errors.title)
                                        }
                                        helperText={
                                            formikEdit.touched.title &&
                                            formikEdit.errors.title
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name="location"
                                        label="Location"
                                        type="text"
                                        fullWidth
                                        value={formikEdit.values.location}
                                        onChange={formikEdit.handleChange}
                                        error={
                                            formikEdit.touched.location &&
                                            Boolean(formikEdit.errors.location)
                                        }
                                        helperText={
                                            formikEdit.touched.location &&
                                            formikEdit.errors.location
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextareaAutosize
                                        className={classes.textarea}
                                        aria-label="minimum height"
                                        rowsMin={5}
                                        placeholder="Description"
                                        name="description"
                                        type="text"
                                        label="description"
                                        value={formikEdit.values.description}
                                        onChange={formikEdit.handleChange}
                                    />
                                    <FormHelperText
                                        error={
                                            formikEdit.touched.description &&
                                            Boolean(
                                                formikEdit.errors.description
                                            )
                                        }
                                    >
                                        {formikEdit.touched.description &&
                                            formikEdit.errors.description}
                                    </FormHelperText>
                                </Grid>

                                <Grid item xs={12}>
                                    <label>Start Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        name="startTime"
                                        value={formikEdit.values.startTime}
                                        onChange={handleFormikDateEditStart}
                                    />
                                    <FormHelperText
                                        error={
                                            formikEdit.touched.startTime &&
                                            Boolean(formikEdit.errors.startTime)
                                        }
                                    >
                                        {formikEdit.touched.startTime &&
                                            formikEdit.errors.startTime}
                                    </FormHelperText>
                                </Grid>

                                <Grid item xs={12}>
                                    <label>End Date</label>
                                    <br />
                                    <DateTimePicker
                                        disableClock={true}
                                        name="endTime"
                                        value={formikEdit.values.endTime}
                                        onChange={handleFormikDateEditEnd}
                                    />
                                    <FormHelperText
                                        error={
                                            formikEdit.touched.endTime &&
                                            Boolean(formikEdit.errors.endTime)
                                        }
                                    >
                                        {formikEdit.touched.endTime &&
                                            formikEdit.errors.endTime}
                                    </FormHelperText>
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
                            {formikEdit.values.title}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <Grid container justify="flex-end" spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            margin="dense"
                                            label="Location"
                                            type="email"
                                            defaultValue={
                                                formikEdit.values.location
                                            }
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
                                            label="Description"
                                            type="email"
                                            defaultValue={
                                                formikEdit.values.description
                                            }
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
                                            label="Start Time"
                                            type="email"
                                            defaultValue={
                                                formikEdit.values.startTime
                                            }
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
                                            label="End Time"
                                            type="email"
                                            defaultValue={
                                                formikEdit.values.endTime
                                            }
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
                    <DialogTitle id="alert-dialog-title">{`Are you sure you wan to delete ${formikEdit.values.title} from your calendar?`}</DialogTitle>
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
