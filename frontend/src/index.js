import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import { ConfirmationDialogProvider } from "./components/hooks/Confirmation";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'alertifyjs/build/css/alertify.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ConfirmationDialogProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
          <App />
        </LocalizationProvider>
      </ConfirmationDialogProvider>
    </Provider>
  </BrowserRouter>
);

reportWebVitals();
