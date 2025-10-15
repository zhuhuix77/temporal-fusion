import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import VirtualGirlfriendPage from './pages/VirtualGirlfriendPage';
import PricingPage from './pages/PricingPage';
import VirtualPetPage from './pages/VirtualPetPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "virtual-girlfriend",
        element: <VirtualGirlfriendPage />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
      {
        path: "virtual-pet",
        element: <VirtualPetPage />,
      },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);