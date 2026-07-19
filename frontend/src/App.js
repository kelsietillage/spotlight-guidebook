import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Winners from "@/pages/Winners";
import Themes from "@/pages/Themes";
import Timelines from "@/pages/Timelines";
import Nomination from "@/pages/Nomination";
import Rubric from "@/pages/Rubric";
import Tracking from "@/pages/Tracking";
import Contacts from "@/pages/Contacts";
import Correspondence from "@/pages/Correspondence";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <HashRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/winners" element={<Winners />} />
              <Route path="/themes" element={<Themes />} />
              <Route path="/timelines" element={<Timelines />} />
              <Route path="/nomination" element={<Nomination />} />
              <Route path="/rubric" element={<Rubric />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/correspondence" element={<Correspondence />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </HashRouter>
    </div>
  );
}

export default App;
