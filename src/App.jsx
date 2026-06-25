import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './features/home/Home';
import About from './features/about/About';
import Services from './features/services/Services';
import Projects from './features/projects/Projects';
import Gallery from './features/gallery/Gallery';
import Contact from './features/contact/Contact';
import GetQuote from './features/quote/GetQuote';
import Blog from './features/blog/Blog';
import Careers from './features/careers/Careers';
import BottomNav from './components/layout/BottomNav';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/get-quote" element={<GetQuote />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
      </Routes>
      <BottomNav />
    </Router>
  );
}

export default App;
