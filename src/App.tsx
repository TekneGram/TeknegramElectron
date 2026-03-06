import './App.css';
import ChatInterface from '@/layout/ChatInterface';
import Header from '@/layout/Header';
import MainView from '@/layout/MainView';
import Sidebar from '@/layout/Sidebar';

function App() {
  

  return (
    <>
      <Header />
      <Sidebar />
      <MainView />
      <ChatInterface />
    </>
  )
}

export default App
