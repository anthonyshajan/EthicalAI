import Layout from "./Layout.jsx";

import Upload from "./Upload";

import Analysis from "./Analysis";

import Dashboard from "./Dashboard";

import Home from "./Home";

import CheckWork from "./CheckWork";

import Chat from "./Chat";

import LocalCheckWork from "./LocalCheckWork";

import LocalChat from "./LocalChat";

import LocalHome from "./LocalHome";

import LocalApp from "./LocalApp";

import LocalUpload from "./LocalUpload";

import LocalAnalysis from "./LocalAnalysis";

import LocalDashboard from "./LocalDashboard";

import LocalFullApp from "./LocalFullApp";

import README_SETUP from "./README_SETUP";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Upload: Upload,
    
    Analysis: Analysis,
    
    Dashboard: Dashboard,
    
    Home: Home,
    
    CheckWork: CheckWork,
    
    Chat: Chat,
    
    LocalCheckWork: LocalCheckWork,
    
    LocalChat: LocalChat,
    
    LocalHome: LocalHome,
    
    LocalApp: LocalApp,
    
    LocalUpload: LocalUpload,
    
    LocalAnalysis: LocalAnalysis,
    
    LocalDashboard: LocalDashboard,
    
    LocalFullApp: LocalFullApp,
    
    README_SETUP: README_SETUP,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Upload />} />
                
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/CheckWork" element={<CheckWork />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/LocalCheckWork" element={<LocalCheckWork />} />
                
                <Route path="/LocalChat" element={<LocalChat />} />
                
                <Route path="/LocalHome" element={<LocalHome />} />
                
                <Route path="/LocalApp" element={<LocalApp />} />
                
                <Route path="/LocalUpload" element={<LocalUpload />} />
                
                <Route path="/LocalAnalysis" element={<LocalAnalysis />} />
                
                <Route path="/LocalDashboard" element={<LocalDashboard />} />
                
                <Route path="/LocalFullApp" element={<LocalFullApp />} />
                
                <Route path="/README_SETUP" element={<README_SETUP />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}