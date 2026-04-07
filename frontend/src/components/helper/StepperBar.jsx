import { Step, StepButton, Stepper } from "@mui/material";

const steps = [
  { slug: "PENDING", name: "Pending" },
  { slug: "IN_PROGRESS", name: "In Progress" },
  { slug: "COMPLETED", name: "Completed" },
];

const statusToStepIndex = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
};

const StepperBar = ({ task, currentStatus, onStatusChange }) => {
  const activeStep = statusToStepIndex[currentStatus] ?? 0;
  const isCanceled = currentStatus === "CANCELED";

  const activeColor = isCanceled ? "error.main" : "success.main";
  const completedColor = "success.main";

  const handleStepClick = (clickedIndex) => {
    const newStatusSlug = steps[clickedIndex].slug;
    onStatusChange(task, newStatusSlug);
  };

  const stepperSx = {
    width: "100%",

    "& .MuiStepIcon-root.Mui-completed": {
      color: completedColor,
    },
    "& .MuiStepIcon-root.Mui-active": {
      color: activeColor,
    },

    "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
      borderColor: completedColor,
      borderStyle: "solid",
      borderWidth: 2,
    },
    "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
      borderColor: activeColor,
      borderStyle: "solid",
      borderWidth: 2,
    },
    "& .MuiStepConnector-root:not(.Mui-completed, .Mui-active) .MuiStepConnector-line":
      {
        borderStyle: "dashed",
        borderColor: "grey.400",
        borderWidth: 2,
      },
  };

  return (
    <Stepper activeStep={activeStep} alternativeLabel nonLinear sx={stepperSx}>
      {steps.map((step, index) => (
        <Step key={step.slug} completed={!isCanceled && index < activeStep}>
          <StepButton color="inherit" onClick={() => handleStepClick(index)}>
            {step.name}
          </StepButton>
        </Step>
      ))}
    </Stepper>
  );
};

export default StepperBar;