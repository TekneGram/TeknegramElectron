import type {
    ActivitiesPort,
    ActivityRequest,
    ActivityResponse,
} from "@/app/ports/activities.ports";
import { invokeRequest } from "./invokeRequest";

export const activitiesAdapter: ActivitiesPort = {
    async getActivities(request: ActivityRequest) {
        return invokeRequest<ActivityRequest, ActivityResponse>("activities:request", request);
    },

    async createActivity(request: ActivityRequest) {
        return invokeRequest<ActivityRequest, ActivityResponse>("activities:request", request);
    },
};
