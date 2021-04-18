module.exports.header = "Authorization";

module.exports.token_prefix = "Bearer ";

module.exports.email_exists_err = "Email already associated with an account.";

module.exports.db_err = "Database failure";

module.exports.server_err = "Oh no, Something failed on the server. Please check the server logs for details.";

module.exports.OAuthRedirect = 'calendar';

module.exports.buildRedirectPath = (route) =>{
    const app_name = "eventree-calendar";
    if (process.env.NODE_ENV === "production") {
        return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
        return "http://localhost:5000/" + route;
    }
}

module.exports.buildRedirectPathClient = (route) =>{
    const app_name = "eventree-calendar";
    if (process.env.NODE_ENV === "production") {
        return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
        return "http://localhost:3000/" + route;
    }
}
