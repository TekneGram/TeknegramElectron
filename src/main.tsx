import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from './App.tsx';
import './styles/fonts.css';
import './styles/theme.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from './app/providers/ThemeProvider';
import { NavigationProvider } from './app/providers/NavigationProvider';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
        <ToastContainer position="top-right" autoClose={4000} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
