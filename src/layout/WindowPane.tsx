import MainView from "./MainView";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatInterface from "./ChatInterface";
import { useModalControl } from "./WindowPane/useModalControl";


const WindowPane = () => {

    const { modalIsOpen, openModal, closeModal } = useModalControl();
    console.log("modalIsOpen", modalIsOpen);

    return (
        <>
            <Header 
                onOpenModal = {openModal}
            />
            <Sidebar />
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