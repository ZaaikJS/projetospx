import { HashRouter as Router, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import TitleBar from "./components/TitleBar";
import Auth from "./pages/Auth";
import Main from "./pages/Main";
import logo from "@/assets/images/logo.png"
import user from "@/assets/images/user.png"
import Cards from "./pages/cards/Cards";
import Whatsapp from "./pages/Whatsapp";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  return (
    <div>
      <TitleBar />
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Auth />} />
          {/* <Route index element={<Initialize />} /> */}
          <Route path="lang" element={undefined} />
        </Route>

        <Route path="/main" element={<MainLayout />}>
          <Route index element={<Main />} />
          <Route path="cards" element={<Cards />} />
          <Route path="whatsapp" element={<Whatsapp />} />
          <Route path="installs" element={undefined} />
        </Route>
      </Routes>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
}

function AuthLayout() {
  return (
    <>
      <div className="auth w-full h-screen flex justify-center items-center">
        <Outlet />
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  );
}

function MainLayout() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`main duration-300`}>
      <div className={`flex h-screen overflow-hidden text-gray-100 duration-300`}>
        <div className="flex-1 flex flex-col">
          <div className="w-full flex justify-between items-center mt-12 mb-4 px-8">
            <div className="cursor-pointer" onClick={() => navigate('/main')}>
              <img src={logo} width={120} />
            </div>
            <div className="flex gap-2">
              <img src={user} width={40} className="rounded-full" />
              <div className="flex flex-col">
                <p>Harrison Viana</p>
                <p className="text-xs opacity-80">harrison.viana@neooh.com.br</p>
              </div>
            </div>
          </div>
          <div
            ref={contentRef}
            className="flex-1 overflow-auto px-6 pb-6"
          >
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </div>
  );
}

export default App;