import {Outlet} from "react-router-dom";
import "./layout.css"

// import { Sidebar } from "./modules/sidebar/index.ts";
import { Header } from "./components/header/index.tsx";

export const Layout = () => {
    
    return(
        <div className="body">
            <Header/>
            <div className="statistics">
                <Outlet/>
            </div>
        </div>
    )
}