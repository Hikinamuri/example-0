import IActionModel from "../models/IActionModel.ts";
import notificationsActionConstants from "./notificationsActionConstants.ts";

export const goodMove = (payload: IActionModel) => {
    return {
        type: notificationsActionConstants.GOOD_MOVE,
        payload
    };
};

export const badAuthorization = (payload: IActionModel) => {
    return {
        type: notificationsActionConstants.BAD_AUTHORIZATION,
        payload
    };
};

export const badRegistration = (payload: IActionModel) => {
    return {
        type: notificationsActionConstants.BAD_REGISTRATION,
        payload
    };
};

export const badUpdate = (payload: IActionModel) => {
    return {
        type: notificationsActionConstants.BAD_UPDATE,
        payload
    };
};

export const badRecovery = (payload: IActionModel) => {
    return {
        type: notificationsActionConstants.BAD_RECOVERY,
        payload
    };
};
