import { HashRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Selector from "./components/Selector";
import Initialize from "./Initialize";
import Home from "./pages/Main/Home";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import TitleBar from "./components/TitleBar";
import Language from "./pages/Language";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import IsAuth from "./contexts/IsAuth";
import Backend from "./Backend";
import Minecraft from "./pages/Main/Minecraft";
import Installs from "./pages/Main/Installs";
import Console from "./Console";
import Options from "./pages/Main/Options";

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
          <Route path="/console" element={<Console />} />
        </Route>
        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="installs" element={<Installs />} />
          <Route path="options" element={<Options />} />
        </Route>
      </Routes>
      <Toaster position="bottom-center" reverseOrder={false} />
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
  const [playSelect, setPlaySelect] = useState("");

  return (
    <IsAuth>
      <div className="flex h-screen pt-8">
      <Selector onPlaySelectChange={setPlaySelect} />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Outlet context={{ playSelect }} />
          </div>
        </div>
      </div>
    </IsAuth>
  );
}

export default App;
