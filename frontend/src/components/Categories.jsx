import React, { useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { categoriesFetch } from "../redux/slices/category/categoriesSlice";

const Categories = () => {
  const authState = useSelector((state) => state.auth);
  const categoriesState = useSelector((state) => state.categories.values);
  const dispatch = useDispatch();

  // Veriyi ilk açılışta çekme mantığını koruyoruz
  useEffect(() => {
    if (authState.accessToken && categoriesState.categories?.length === 0) {
      dispatch(categoriesFetch());
    }
  }, [authState.accessToken, dispatch, categoriesState.categories?.length]);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ flexGrow: 1, p: { xs: 0, md: 3 }, display: "flex", flexDirection: "column" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt:{xs:1,md:0} }}>
          Categories
        </Typography>

        <Paper
          sx={{ flexGrow: 1, overflowY: "auto", p: 2, bgcolor: "transparent" }}
          elevation={0}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {categoriesState.categories?.map((category) => (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { scale: 0.9, y: 10, opacity: 0 },
                  visible: { scale: 1, y: 0, opacity: 1 },
                }}
              >
                <Paper
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: "white",
                    borderLeft: `4px solid ${category.color}`,
                    boxShadow: "0px 2px 4px "+category.color+"20",
                  }}
                >
                  <Box sx={{ flexGrow: 1, ml: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: "#333" }}>
                      {category.name}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            ))}

            {categoriesState.categories?.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
                No categories found.
              </Typography>
            )}
          </motion.div>
        </Paper>
      </Box>
    </Box>
  );
};

export default Categories;