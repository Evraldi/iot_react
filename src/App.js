import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Thermometer, Droplets, Sun, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.js";
import { Alert, AlertDescription } from "./components/ui/alert.js";
import { Button } from "./components/ui/button.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const [currentData, setCurrentData] = useState({ temperature: 0, humidity: 0, lightLevel: 0 });
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [sensorStatus, setSensorStatus] = useState({ dht22: 'inactive', ldr: 'inactive' });


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.history) {
        setHistory(data.history);
      } else if (data.temperature && data.humidity && data.lightLevel) {
        setCurrentData({
          temperature: data.temperature,
          humidity: data.humidity,
          lightLevel: data.lightLevel
        });
      }
      if (data.status) {
        setSensorStatus(data.status);
      }
    };

    return () => ws.close();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/history');
      const data = await response.json();

      setHistory(data.history);
      filterData(data.history, startDate, endDate);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = (data, start, end) => {
    const filteredData = data.filter(item => {
      const timestamp = new Date(item.timestamp);
      return timestamp >= start && timestamp <= end;
    });
    setFilteredHistory(filteredData);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    filterData(history, date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    filterData(history, startDate, date);
  };

  const calculateStats = (data, field) => {
    if (!data.length) return { avg: 0, min: 0, max: 0 };
    const values = data.map(entry => entry[field]);
    return {
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
      min: Math.min(...values).toFixed(1),
      max: Math.max(...values).toFixed(1)
    };
  };

  const tempStats = calculateStats(filteredHistory, 'temperature');
  const humidStats = calculateStats(filteredHistory, 'humidity');
  const lightStats = calculateStats(filteredHistory, 'lightLevel');

  const formatData = filteredHistory.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { temperature, humidity, lightLevel, timestamp } = payload[0].payload;

      return (
        <div className="p-2 bg-white border rounded shadow-lg text-sm text-gray-700">
          <p className="font-semibold">{new Date(timestamp).toLocaleString()}</p>
          <p>Temperature: {temperature}°C</p>
          <p>Humidity: {humidity}%</p>
          <p>Light Level: {lightLevel}</p>
        </div>
      );
    }

    return null;
  };

  const StatCard = ({ title, value, unit, icon: Icon, stats, sensorStatus, sensorName }) => (
    <Card className="w-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-bold text-gray-900">{value}{unit}</div>
            <div className="text-sm text-gray-600">
              Avg: {stats.avg}{unit} • Min: {stats.min}{unit} • Max: {stats.max}{unit}
            </div>
          </div>
          <div className={`flex items-center ${value > stats.avg ? 'text-green-500' : 'text-red-500'}`}>
            {value > stats.avg ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          </div>
        </div>
        {/* Display sensor status */}
        <div className="mt-2">
          <div className="text-sm text-gray-600">
            {sensorName} Status: <span className={sensorStatus[sensorName] === 'active' ? 'text-green-500' : 'text-red-500'}>
              {sensorStatus[sensorName]}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Sensor Dashboard</h1>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              showTimeSelect
              dateFormat="yyyy/MM/dd HH:mm"
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              showTimeSelect
              dateFormat="yyyy/MM/dd HH:mm"
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Temperature"
            value={currentData.temperature}
            unit="°C"
            icon={Thermometer}
            stats={tempStats}
            sensorStatus={sensorStatus}
            sensorName="dht22"
          />
          <StatCard
            title="Humidity"
            value={currentData.humidity}
            unit="%"
            icon={Droplets}
            stats={humidStats}
            sensorStatus={sensorStatus}
            sensorName="dht22"
          />
          <StatCard
            title="Light Level"
            value={currentData.lightLevel}
            unit=""
            icon={Sun}
            stats={lightStats}
            sensorStatus={sensorStatus}
            sensorName="ldr"
          />
        </div>

        {/* Chart */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Historical Data</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHistory.length > 0 ? (
              <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="lightLevel" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <Alert>
                <AlertDescription>No historical data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
