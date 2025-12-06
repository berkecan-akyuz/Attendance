interface AttendanceHeatMapProps {
  compact?: boolean;
  data?: Array<{ date: string; attendance: number }>;
}

export function AttendanceHeatMap({ compact = false, data = [] }: AttendanceHeatMapProps) {
  const generateHeatMapData = () => {
    if (data.length) {
      return data.map((item, index) => ({
        week: Math.floor(index / 7),
        day: index % 7,
        attendance: item.attendance,
      }));
    }
    const fallback = [] as { week: number; day: number; attendance: number }[];
    const weeks = 5;
    const daysPerWeek = 7;

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        const attendance = Math.floor(Math.random() * 30) + 70;
        fallback.push({
          week,
          day,
          attendance,
        });
      }
    }
    return fallback;
  };

  const heatMapData = generateHeatMapData();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getColorForAttendance = (attendance: number) => {
    if (attendance >= 95) return 'bg-green-600';
    if (attendance >= 90) return 'bg-green-500';
    if (attendance >= 85) return 'bg-green-400';
    if (attendance >= 80) return 'bg-yellow-400';
    if (attendance >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (compact) {
    return (
      <div className="space-y-2 overflow-x-auto">
        <div className="flex gap-1 flex-wrap">
          {heatMapData.slice(0, 21).map((item, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded ${getColorForAttendance(item.attendance)} hover:opacity-80 transition-opacity cursor-pointer`}
              title={`${item.attendance}% attendance`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="w-12"></div>
        {dayLabels.map((day, index) => (
          <div key={index} className="w-16 text-center text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      {[0, 1, 2, 3, 4].map((week) => (
        <div key={week} className="flex gap-2 items-center">
          <div className="w-12 text-gray-600">Week {week + 1}</div>
          {dayLabels.map((_, day) => {
            const dataPoint = heatMapData.find((d) => d.week === week && d.day === day);
            return (
              <div
                key={day}
                className={`w-16 h-16 rounded-lg ${
                  dataPoint ? getColorForAttendance(dataPoint.attendance) : 'bg-gray-100'
                } hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center`}
                title={dataPoint ? `${dataPoint.attendance}% attendance` : 'No data'}
              >
                {dataPoint && (
                  <span className="text-white">{dataPoint.attendance}%</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
        <span className="text-gray-600">Lower</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded bg-red-500"></div>
          <div className="w-6 h-6 rounded bg-yellow-500"></div>
          <div className="w-6 h-6 rounded bg-yellow-400"></div>
          <div className="w-6 h-6 rounded bg-green-400"></div>
          <div className="w-6 h-6 rounded bg-green-500"></div>
          <div className="w-6 h-6 rounded bg-green-600"></div>
        </div>
        <span className="text-gray-600">Higher</span>
      </div>
    </div>
  );
}