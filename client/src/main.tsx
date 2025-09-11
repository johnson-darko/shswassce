import { createRoot } from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")!).render(
	<ThemeProvider>
		<HashRouter>
			<App />
		</HashRouter>
	</ThemeProvider>
);
