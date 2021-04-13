function buildPath(route) {
    const app_name = "eventure-calendar";
    if (process.env.NODE_ENV === "production") {
        return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
        return "http://localhost:5000/" + route;
    }
}
export default buildPath;