import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<HashRouter>
		<App />
	</HashRouter>
);
