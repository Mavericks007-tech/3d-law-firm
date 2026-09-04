import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Statement from "./components/Statement";
import Stats from "./components/Stats";
import Practice from "./components/Practice";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Stats />
        <Practice />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
