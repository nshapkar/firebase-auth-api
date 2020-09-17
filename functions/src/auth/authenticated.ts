import {Request, Response} from "express";
import {admin} from "../db";

export async function isAuthenticated(req: Request, res: Response, next: Function) {
    const {authorization} = req.headers;

    if (!authorization)
        return res.status(401).send({message: 'Unauthorized'});

    if (!authorization.startsWith('Bearer'))
        return res.status(401).send({message: 'Unauthorized'});

    const authArray = authorization.split('Bearer ');
    if (authArray.length !== 2)
        return res.status(401).send({message: 'Unauthorized'});

    const token = authArray[1];

    try {
        const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);

        // console.log('decodedToken', JSON.stringify(decodedToken, null, 2));
        res.locals = {
            ...res.locals,
            uid: decodedToken.uid,
            role: decodedToken.role,
            email: decodedToken.email
        };
        return next();
    } catch (e) {
        console.error(`${e.code} - ${e.message}`);
        return res.status(401).send({message: 'Unauthorized'});
    }
}
