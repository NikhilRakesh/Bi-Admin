import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";

function App() {
  return (
    <>
      <div className="md:flex max-h-screen bg-[#fefbf0]">
        <Header />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
