import MainView from "./MainView";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatInterface from "./ChatInterface";
import { useModalControl } from "./WindowPane/useModalControl";
import { useState } from "react";
import type { MainViewRoute } from "./MainView/mainViewRoute";


const WindowPane = () => {
    const { modalIsOpen, openModal, closeModal } = useModalControl();
    const [mainViewRoute, setMainViewRoute] = useState<MainViewRoute>("home");

    function handleNavigateHome() {
        setMainViewRoute("home");
    }

    function handleNavigateSettings() {
        setMainViewRoute("settings");
    }

    return (
        <>
            <Header 
                onOpenModal = {openModal}
                currentRoute={mainViewRoute}
                onNavigateHome={handleNavigateHome}
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
