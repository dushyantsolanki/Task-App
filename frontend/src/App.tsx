import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from '@/routes/route.tsx';
import { useSocket } from '@/hooks/useSocket.ts';
import { useAuthStore } from '@/store/authStore.ts';
import AxiousInstance from '@/helper/AxiousInstance.tsx';
import { messaging } from '@/firebase/firebaseConfig.ts';
import { getToken } from 'firebase/messaging';
import { Spinner } from './components/ui/kibo-ui/spinner';

// import ProtectedRoute from './routes/ProtectedRoute';

const App: React.FC = () => {
  const { user } = useAuthStore();
  const { connect, disconnect } = useSocket();

  async function requestPermission() {
    try {
      //requesting permission using Notification API
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_VAPID_KEY,
        });
        if (token && user?.id) {
          await AxiousInstance.post(`/firebase/${user?.id}/token`, {
            fcm_token: token,
          });
        }

        //We can send token to server
      } else if (permission === 'denied') {
        //notifications are blocked
        // alert('You denied for the notification');
      }
    } catch (error) {
      console.error('Error :>', error);
    }
  }

  useEffect(() => {
    if (!user.id) {
      disconnect();
      console.error('No access token found in cookies');
      return;
    }
    requestPermission();
    connect(user.id as string);
  }, []);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="bg-background flex h-screen w-screen items-center justify-center">
            <Spinner className="text-primary h-12 w-12" />
          </div>
        }
      >
        <Routes>
          {routes.map(({ layout: Layout, guard: Guard, children }, i) => (
            <Route
              key={i + Math.floor(Math.random() * 1000)}
              element={
                Guard ? (
                  <Guard>
                    <Layout />
                  </Guard>
                ) : (
                  <Layout />
                )
              }
            >
              {children.map(({ path, element, allowedRoles }, j) => {
                const wrappedElement =
                  allowedRoles && allowedRoles.length > 0
                    ? // <ProtectedRoute allowedRoles={allowedRoles}>
                    { element }
                    : // </ProtectedRoute>
                    element;

                return (
                  <Route
                    key={j + 1000 + Math.floor(Math.random() * 1000)}
                    path={path}
                    element={wrappedElement as React.ReactNode}
                  />
                );
              })}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
