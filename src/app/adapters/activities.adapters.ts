import type {
    ActivitiesPort,
    CreateActivityRequest,
    GetActivitiesRequest,
    ActivityResponse,
} from "@/app/ports/activities.ports";
import { invokeRequest } from "./invokeRequest";

export const activitiesAdapter: ActivitiesPort = {
    async getActivities(request: GetActivitiesRequest) {
        return invokeRequest<GetActivitiesRequest, ActivityResponse>("activities:get", request);
    },

    async createActivity(request: CreateActivityRequest) {
        return invokeRequest<CreateActivityRequest, ActivityResponse>("activities:create", request);
    },
};
