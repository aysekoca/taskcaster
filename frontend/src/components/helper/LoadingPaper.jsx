import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

// 1. Kenarlığın dönme animasyonu
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingPaper = ({ isLoading, children }) => {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4, // Proje standardın
        p: {xs:'1px',lg:"3px"}, // Kenarlık kalınlığı kadar boşluk
        overflow: "hidden", // Dışarı taşan animasyonu gizler
        bgcolor: isLoading ? "transparent" : "divider",
        transition: "all 0.3s ease",
      }}
    >
      {/* 2. Arka planda dönen gradient (Sadece yüklenirken görünür) */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background:
              "conic-gradient(transparent, #2196f3, #21cbf3, transparent 70%)",
            animation: `${rotate} 2s linear infinite`,
            zIndex: 0,
          }}
        />
      )}

      {/* 3. Gerçek İçerik Paneli */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          borderRadius: "13px", // Dış kutudan biraz daha az (p:3px olduğu için)
          bgcolor: "background.paper",
          height: "100%",
          p: { xs: 2, md: 4 },
        }}
      >
        {isLoading ? (
          <>
            <Box height="200px"></Box>
          </>
        ) : (
          children
        )}
      </Paper>
    </Box>
  );
};

export default LoadingPaper;
