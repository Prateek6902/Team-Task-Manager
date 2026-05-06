import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend, Sector
} from 'recharts';
import { motion } from 'framer-motion';

// 3D Active Shape for Pie/Donut
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <filter id="shadow3d">
        <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.3"/>
      </filter>
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius}
        outerRadius={outerRadius + 10} startAngle={startAngle}
        endAngle={endAngle} fill={fill}
        filter="url(#shadow3d)"
      />
    </g>
  );
};

// 3D Pie Chart - Task Status
export const PieChart3D = ({ data, title }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <filter key={index} id={`shadow-${index}`}>
                <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.3"/>
              </filter>
            ))}
          </defs>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            style={{ filter: 'url(#shadow)' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} filter={`url(#shadow-${index})`} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// 3D Donut Chart - Department Performance
export const DonutChart3D = ({ data, title }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <filter key={index} id={`donut-shadow-${index}`}>
                <feDropShadow dx="4" dy="6" stdDeviation="5" floodOpacity="0.35"/>
              </filter>
            ))}
          </defs>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={8}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} filter={`url(#donut-shadow-${index})`} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// 3D Area Chart - Productivity
export const AreaChart3D = ({ data, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <filter id="areaShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3"/>
            </filter>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#6C63FF"
            strokeWidth={3}
            fill="url(#colorGradient)"
            filter="url(#areaShadow)"
            name="Completed"
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke="#4CAF50"
            strokeWidth={2}
            fill="transparent"
            name="Created"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// 3D Bar Chart - Team Workload
export const BarChart3D = ({ data, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <defs>
            <filter id="bar3d">
              <feDropShadow dx="3" dy="5" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#6C63FF" filter="url(#bar3d)" radius={[8, 8, 0, 0]} name="Total Tasks" />
          <Bar dataKey="completed" fill="#4CAF50" filter="url(#bar3d)" radius={[8, 8, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// 3D Line Chart - Weekly Completion
export const LineChart3D = ({ data, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <filter id="lineShadow">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#6C63FF"
            strokeWidth={4}
            filter="url(#lineShadow)"
            dot={{ r: 6, fill: '#6C63FF', strokeWidth: 2 }}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ r: 4, fill: '#4CAF50' }}
            name="Created"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
