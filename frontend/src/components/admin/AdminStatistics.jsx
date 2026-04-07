import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid'; // Correct MUI v6+ Grid import
import { Card, CardContent, Typography, Avatar, Box, Divider, Paper, Stack } from '@mui/material';
import { motion } from "framer-motion"; // Animation library
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

// Icons
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useDispatch, useSelector } from 'react-redux';
import { adminStatisticsFetch } from '../../redux/slices/admin/stat/adminStatisticsSlice';

// --- ANIMATION VARIANTS (Consistent with TaskList) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 } // Cards flow one by one
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <motion.div variants={itemVariants}>
    <Card variant="outlined" sx={{ borderRadius: 4, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>{title}</Typography>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            <Typography variant="caption" color={subtitle.includes('+') ? 'success.main' : 'error.main'} sx={{ mt: 1, display: 'block' }}>
              {subtitle}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, borderRadius: 2 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminStatistics = () => {
  const state = useSelector(state=>state.adminStatistics.values)
  const fetchState = useSelector(state=>state.adminStatistics.forFetch)
  const [pichartValues, setPiechartValues] = useState([]);
  const [barchartValues,setBarchartValues] = useState([])
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(adminStatisticsFetch())
  },[]);
  useEffect(()=>{
    setPiechartValues(state.catStats.map(c=>{return {name:c.categoryName,value:c.total,color:c.color}}))
    setBarchartValues(state.catStats.map(c=>{return {category:c.categoryName,Complete:c.completedCount,Incomplete:c.incompletedCount}}))
  },[state])


  return (
    <Box component={motion.div} initial="hidden" animate="visible" variants={containerVariants}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        System Analytics
      </Typography>

      {/* --- TOP SUMMARY CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Total Users" value={state.userCount} subtitle="" icon={<GroupIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Total Tasks" value={state.totalTaskCount} subtitle="" icon={<AssignmentIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Completed Tasks" value={state.completedTaskCount} subtitle="" icon={<TrendingUpIcon />} color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>{/*         
        {/* PIE CHART */}
        <Grid size={{ xs: 12, lg: 5 }} component={motion.div} variants={itemVariants}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 450 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Task Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={pichartValues} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} paddingAngle={5} label>
                  {pichartValues.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* BAR CHART */}
        <Grid size={{ xs: 12, lg: 7 }} component={motion.div} variants={itemVariants}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 450 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Category Performance</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barchartValues}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="Complete" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Incomplete" fill="#FF8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStatistics;