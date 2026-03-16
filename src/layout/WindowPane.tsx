import MainView from "./MainView";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatInterface from "./ChatInterface";
import { useModalControl } from "./WindowPane/useModalControl";
import { useListProjectsQuery } from "@/features/ProjectsTinyView/hooks/useProjectsQuery";
import { useEffect, useState } from "react";
import type { MainViewRoute } from "./MainView/mainViewRoute";


const WindowPane = () => {
    const { modalIsOpen, openModal, closeModal } = useModalControl();
    const { data: projects, isError } = useListProjectsQuery();
    const [mainViewRoute, setMainViewRoute] = useState<MainViewRoute>("auto");

    const hasProjects = (projects?.length ?? 0) > 0;

    useEffect(() => {
        if (!hasProjects && mainViewRoute === "projects") {
            setMainViewRoute("auto");
        }
    }, [hasProjects, mainViewRoute]);

    function handleNavigateProjects() {
        if (!hasProjects) {
            return;
        }

        setMainViewRoute("projects");
    }

    function handleNavigateSettings() {
        setMainViewRoute("settings");
    }

    return (
        <>
            <Header 
                onOpenModal = {openModal}
                currentRoute={mainViewRoute}
                hasProjects={hasProjects && !isError}
                onNavigateProjects={handleNavigateProjects}
                onNavigateSettings={handleNavigateSettings}
            />
            <Sidebar 
                onOpenModal = {openModal}
            />
            <MainView 
                modalIsOpen = {modalIsOpen}
                onOpenModal = {openModal}
                onCloseModal = {closeModal}
                route={mainViewRoute}
            />
            <ChatInterface />
        </>
    );
};

export default WindowPane;
