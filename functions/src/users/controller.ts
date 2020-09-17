import {Request, Response} from "express";
import {db, FirestorePath, admin} from "../db";

type Role = string | 'admin' | 'local';

export async function create(req: Request, res: Response) {
    try {
        const {displayName, password, email, hasTable} = req.body;
        let role: Role = req.body.role;

        if (!displayName || !password || !email || !role) {
            return res.status(400).send({message: 'Missing fields'})
        }
        role = role.toLowerCase();
        const userObj = {displayName, password, email};
        const user = await admin.auth().createUser(userObj);
        await admin.auth().setCustomUserClaims(user.uid, {role});

        delete userObj.password;
        console.log('role', role);
        if (role === 'local') {
            Object.assign(userObj, {hasTable})
        }
        Object.assign(userObj, {
            creationTime: new Date(Date.parse(user.metadata.creationTime))
        });

        await db
            .collection(FirestorePath.root)
            .doc(FirestorePath.environment)
            .collection(FirestorePath.locals)
            .doc(user.uid)
            .create(userObj)
            // .set(userObj, {merge: true})
            .then(console.log)
            .catch(console.log);

        console.log('test');

        return res.status(201).send({uid: user.uid});
    } catch (e) {
        return handleError(res, e);
    }
}

export async function all(req: Request, res: Response) {
    try {
        const listUsers = await admin.auth().listUsers();
        const users = listUsers.users.map(mapUser);
        return res.status(200).send({users});
    } catch (e) {
        return handleError(res, e);
    }

}

function mapUser(user: admin.auth.UserRecord) {
    const customClaims = (user.customClaims || {role: ''}) as { role?: string };
    const role = customClaims.role ? customClaims.role : '';

    return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime
    }
}

export async function get(req: Request, res: Response) {
    try {
        const {id} = req.params;
        const user = await admin.auth().getUser(id);
        return res.status(200).send({user: mapUser(user)});
    } catch (e) {
        return handleError(res, e);
    }
}

export async function patch(req: Request, res: Response) {
    try {
        const {id} = req.params;
        const {displayName, password, email, role, hasTable} = req.body;

        if (!id || !displayName || !password || !email || !role) {
            return res.status(400).send({message: 'Missing fields'});
        }

        await admin.auth().updateUser(id, {displayName, password, email});
        await admin.auth().setCustomUserClaims(id, {role});
        const user = await admin.auth().getUser(id);
        await db.collection(FirestorePath.root)
            .doc(FirestorePath.environment)
            .collection(FirestorePath.locals)
            .doc(id)
            .set({
                displayName,
                email,
                hasTable
            }, {merge: true});


        return res.status(204).send({user: mapUser(user)});
    } catch (e) {
        return handleError(res, e);
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const {id} = req.params;
        console.log('id', id);
        await admin.auth().deleteUser(id);
        await db.collection(FirestorePath.root)
            .doc(FirestorePath.environment)
            .collection(FirestorePath.locals)
            .doc(id)
            .delete();
        return res.status(204).send({});
    } catch (e) {
        console.log('error deleting', e);
        return handleError(res, e);
    }
}

function handleError(res: Response, err: any) {
    return res.status(500).send({message: `${err.code} - ${err.message}`});
}
