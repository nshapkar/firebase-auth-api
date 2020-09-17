import {Application} from "express";
import {all, create, get, patch, remove} from "./controller";
import {isAuthenticated} from "../auth/authenticated";
import {isAuthorized} from "../auth/authorized";

export function routesConfig(app: Application) {
    app.get('/users', [
        isAuthenticated,
        isAuthorized({hasRole: 'admin', allowSameUser: true}),
        all
    ]);

    app.post('/users', [
        isAuthenticated,
        isAuthorized({hasRole: 'admin'}),
        create
    ]);

    app.get('/users/:id', [
        isAuthenticated,
        isAuthorized({hasRole: 'admin', allowSameUser: true}),
        get
    ]);

    app.patch('/users/:id', [
        isAuthenticated,
        isAuthorized({hasRole: 'admin', allowSameUser: true}),
        patch
    ]);

    app.delete('/users/:id', [
        isAuthenticated,
        isAuthorized({hasRole: 'admin'}),
        remove
    ]);
}
