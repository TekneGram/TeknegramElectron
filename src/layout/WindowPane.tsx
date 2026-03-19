import MainView from "./MainView";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatInterface from "./ChatInterface";
import { useModalControl } from "./WindowPane/useModalControl";



const WindowPane = () => {
    const { modalIsOpen, openModal, closeModal } = useModalControl();
    

    return (
        <>
            <Header 
                onOpenModal = {openModal}
            />
            <Sidebar 
                onOpenModal = {openModal}
            />
            <MainView 
                modalIsOpen = {modalIsOpen}
                onOpenModal = {openModal}
                onCloseModal = {closeModal}
            />
            <ChatInterface />
        </>
    );
};

export default WindowPane;
