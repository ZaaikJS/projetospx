import { HashRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Selector from "./components/Selector";
import Initialize from "./Initialize";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import TitleBar from "./components/TitleBar";
import Language from "./pages/Language";
import { useEffect, useState } from "react";
import Backend from "./Backend";
import VoxyLogin from "./pages/Auth/VoxyLogin";
import VoxyRegister from "./pages/Auth/VoxyRegister";
import Offline from "./pages/Auth/Offline";
import { Toaster } from "react-hot-toast";
import IsAuth from "./contexts/IsAuth";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const [background, setBackground] = useState("auth");

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setBackground("auth");
        break;
      case "/terms":
        setBackground("auth");
        break;
      case "/auth":
        setBackground("auth");
        break;
      default:
        setBackground("home");
        break;
    }
  }, [location.pathname]);

  return (
    <div className={background}>
      <TitleBar />
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Initialize />} />
          {/* <Route index element={<Backend />} /> */}
          <Route path="/lang" element={<Language />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

function BaseLayout() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Outlet />
    </div>
  );
}

function MainLayout() {
  return (
    <IsAuth>
      <div className="flex h-screen pt-8">
        <Selector />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Outlet />
          </div>
        </div>
      </div>
    </IsAuth>
  );
}

export default App;
