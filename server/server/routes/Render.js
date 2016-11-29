"use strict";
var Render;
(function (Render) {
    function withUser(req, res, loc, data = {}) {
        const sendData = data;
        sendData['user'] = req.user;
        res.render(loc, sendData);
    }
    Render.withUser = withUser;
    function error(req, res, err) {
        res.render("error", {
            user: req.user,
            error: err
        });
    }
    Render.error = error;
    function groupDetails(req, res, loc, data) {
        res.render(loc, {
            user: req.user,
            admin: data.admins.indexOf(req.user.id) >= 0,
            a_open: data.openAssignments,
            a_close: data.closedAssignments,
            a_done: data.doneAssignments,
            group: {
                id: data.id,
                name: data.name
            }
        });
    }
    Render.groupDetails = groupDetails;
    function file(req, res, loc, data, group, token, admin) {
        res.render(loc, {
            user: req.user,
            file: data,
            admin: admin,
            group: group,
            token: token
        });
    }
    Render.file = file;
    function groupsOverview(app, loc, data, success, fail) {
        render(app, loc, {
            groups: data
        }, success, fail);
    }
    Render.groupsOverview = groupsOverview;
    function upload(app, loc, project, filename, success, fail) {
        render(app, loc, {
            project: project,
            file: filename
        }, success, fail);
    }
    Render.upload = upload;
    function users(app, loc, data, success, fail) {
        render(app, loc, {
            users: data
        }, success, fail);
    }
    Render.users = users;
    function files(app, loc, data, success, fail) {
        render(app, loc, {
            files: data
        }, success, fail);
    }
    Render.files = files;
    function render(app, loc, data, success, fail) {
        app.render(loc, data, (err, suc) => {
            if (err)
                fail(err);
            else
                success(suc);
        });
    }
    Render.render = render;
    function results(app, loc, project, data, success, fail) {
        render(app, loc, {
            tests: data,
            project: project
        }, success, fail);
    }
    Render.results = results;
})(Render = exports.Render || (exports.Render = {}));
//# sourceMappingURL=Render.js.map