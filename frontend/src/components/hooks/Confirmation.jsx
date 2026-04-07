import React, { createContext, useContext, useState, useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const ConfirmationContext = createContext(null);

const defaultOptions = {
  open: false,
  title: "",
  description: "",
  onConfirm: () => {},
  onCancel: () => {},
  confirmText: "Confirm",
  cancelText: "Cancel",
};

export const ConfirmationDialogProvider = ({ children }) => {
  const [options, setOptions] = useState(defaultOptions);

  const showConfirm = useCallback((newOptions) => {
    setOptions({ ...defaultOptions, ...newOptions, open: true });
  }, []);

  const handleConfirm = () => {
    options.onConfirm(); 
    setOptions(defaultOptions);
  };

  const handleClose = () => {
    options.onCancel(); 
    setOptions(defaultOptions); 
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirm }}>
      {children}
      <Dialog open={options.open} onClose={handleClose}>
        <DialogTitle>{options.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{options.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {options.cancelText}
          </Button>
          <Button onClick={handleConfirm} color="error" autoFocus>
            {options.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmation, ConfirmationDialogProvider içinde kullanılmalıdır."
    );
  }
  return context;
};
