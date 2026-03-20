import { useContext } from "react";
import { ActivityStartContext } from "./activity-start-context";

export function useActivityStart() {
    const context = useContext(ActivityStartContext);

    if (!context) {
        throw new Error("useActivityStart must be used within an ActivityStartProvider");
    }

    return context;
}