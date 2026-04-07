import { Alert, Snackbar, Typography } from "@mui/material";

export const AlertSnackBar = ({ snackbarState, onClose }) => {
  const {
    message = "There is an Error",
    status = "warning",
    vertical = "top",
    horizontal = "center",
    duration = 3000,
    isOpen = false,
  } = snackbarState;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      anchorOrigin={{ vertical, horizontal }}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={status}
        variant="filled"
        sx={{ width: "100%",whiteSpace: "pre-wrap" }}
      >
        <Typography>{message}</Typography>
      </Alert>
    </Snackbar>
  );
};