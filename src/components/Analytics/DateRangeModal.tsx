import { useState } from "react";
import { FiCalendar, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

export default function DateRangeModal({
  isOpen,
  onClose,
  onApply,
}: DateRangeModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return;

    const dateStr = formatDate(date);
    if (selecting === "start") {
      setStartDate(dateStr);
      setSelecting("end");
    } else {
      if (dateStr >= startDate) {
        setEndDate(dateStr);
      } else {
        setEndDate(startDate);
        setStartDate(dateStr);
      }
    }
  };

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      setStartDate("");
      setEndDate("");
      setSelecting("start");
      onClose();
    }
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + (direction === "prev" ? -1 : 1),
        1
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Select Date Range
          </h2>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelecting("start");
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between mb-4">
            <div className="w-1/2 pr-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div
                className={`flex items-center p-2 border rounded-lg ${
                  selecting === "start" ? "border-[#c5b648]" : "border-gray-300"
                }`}
              >
                <FiCalendar className="text-gray-400 mr-2" />
                <input
                  type="text"
                  className="w-full outline-none"
                  value={startDate}
                  readOnly
                  onClick={() => setSelecting("start")}
                />
              </div>
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div
                className={`flex items-center p-2 border rounded-lg ${
                  selecting === "end" ? "border-[#c5b648]" : "border-gray-300"
                }`}
              >
                <FiCalendar className="text-gray-400 mr-2" />
                <input
                  type="text"
                  className="w-full outline-none"
                  value={endDate}
                  readOnly
                  onClick={() => setSelecting("end")}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeMonth("prev")}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiChevronLeft size={20} />
              </button>
              <h3 className="font-medium text-gray-800">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => changeMonth("next")}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <div
                  key={index}
                  className={`h-10 flex items-center justify-center rounded-full text-sm
                    ${date ? "cursor-pointer hover:bg-gray-100" : ""}
                    ${
                      date && formatDate(date) === startDate
                        ? "bg-blue-500 text-white"
                        : ""
                    }
                    ${
                      date && formatDate(date) === endDate
                        ? "bg-blue-500 text-white"
                        : ""
                    }
                    ${
                      date &&
                      startDate &&
                      endDate &&
                      formatDate(date) >= startDate &&
                      formatDate(date) <= endDate
                        ? "bg-blue-100"
                        : ""
                    }
                    ${
                      date && date.getMonth() !== month
                        ? "text-gray-300"
                        : "text-gray-700"
                    }
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  {date ? date.getDate() : ""}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelecting("start");
              onClose();
            }}
            className="px-4 py-2 mr-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className={`px-4 py-2 rounded-lg text-white ${
              !startDate || !endDate
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Apply Date Range
          </button>
        </div>
      </div>
    </div>
  );
}
