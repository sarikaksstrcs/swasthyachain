import { useState } from 'react';
import { Clock, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../../services/appoinment.service';


export const DoctorAvailability = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([{ start: '', end: '' }]);
  const [loading, setLoading] = useState(false);

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: '', end: '' }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const validSlots = timeSlots.filter(slot => slot.start && slot.end);
    if (validSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    setLoading(true);
    try {
      const availabilityData = validSlots.map(slot => ({
        date: selectedDate,
        start_time: slot.start,
        end_time: slot.end,
        is_available: true
      }));

      await appointmentService.createBulkAvailability(availabilityData);
      
      toast.success(`${validSlots.length} time slot(s) added successfully`);
      setSelectedDate('');
      setTimeSlots([{ start: '', end: '' }]);
    } catch (error) {
      toast.error('Failed to add availability');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateBulkSlots = () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }

    const slots = appointmentService.generateTimeSlots(9, 17, 30);
    setTimeSlots(slots);
    toast.success('Generated standard working hours (9 AM - 5 PM)');
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Clock className="h-8 w-8 text-blue-600" />
          Set Availability
        </h1>

        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date *
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={generateBulkSlots}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Full Day
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Quick generate will create 30-minute slots from 9 AM to 5 PM
            </p>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Time Slots *
              </label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                Save Availability
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use "Generate Full Day" for quick setup of standard working hours</li>
            <li>You can add multiple time slots for the same day</li>
            <li>Time slots should not overlap</li>
            <li>Patients can book available slots from their dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};