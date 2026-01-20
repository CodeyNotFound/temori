import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, 
  Plus, Search, ArrowLeft, Clock, List, AlignLeft, Grid, Briefcase,
  X, Save, Check, MapPin, ToggleLeft, ToggleRight,
  FileText, Paperclip, Users, Tag, Eye, EyeOff, Copy, Trash,
  AlertTriangle, Bell, Flag, Car, Dumbbell, Utensils, Coffee,
  MoreVertical, CheckSquare, XCircle, HelpCircle, MousePointer2
} from 'lucide-react';

interface CalendarPageProps {
  onBack: () => void;
}

type ViewType = 'month' | 'week' | 'day' | 'year' | 'agenda' | '3day' | 'workweek' | 'schedule';
type EventStatus = 'confirmed' | 'tentative' | 'cancelled';
type EventPriority = 'high' | 'medium' | 'low';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  location?: string;
  isAllDay?: boolean;
  // New Fields
  description?: string;
  attachments?: string[]; // Array of links/filenames
  participants?: string[];
  tags?: string[];
  isPrivate?: boolean;
  status?: EventStatus;
  priority?: EventPriority;
  bufferMinutes?: number; // Travel time
  reminders?: number[]; // Minutes before
}

// --- Date Utilities ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getDayOfWeek = (year: number, month: number, day: number) => new Date(year, month, day).getDay();
const addDays = (date: Date, days: number) => { const r = new Date(date); r.setDate(r.getDate() + days); return r; };
const addMonths = (date: Date, months: number) => { const r = new Date(date); r.setMonth(r.getMonth() + months); return r; };
const startOfWeek = (date: Date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day; return new Date(d.setDate(diff)); };
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// --- NLP Utility ---
const parseNaturalLanguage = (input: string): Partial<Event> => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let title = input;
    let isAllDay = false;

    // Detect "tomorrow"
    if (input.toLowerCase().includes('tomorrow')) {
        start = addDays(start, 1);
        end = addDays(end, 1);
        title = title.replace(/tomorrow/i, '');
    }

    // Detect Time (Simple Regex for HH:MM or HHam/pm)
    const timeMatch = input.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        const meridian = timeMatch[4]?.toLowerCase();
        
        if (meridian === 'pm' && hours < 12) hours += 12;
        if (meridian === 'am' && hours === 12) hours = 0;
        
        start.setHours(hours, minutes, 0, 0);
        end.setHours(hours + 1, minutes, 0, 0); // Default 1h duration
        title = title.replace(timeMatch[0], '');
    } else {
        isAllDay = true;
    }

    return {
        title: title.trim(),
        start,
        end,
        isAllDay
    };
};

// --- Mock Data Generator ---
const generateMockEvents = (baseDate: Date): Event[] => {
  const y = baseDate.getFullYear();
  const m = baseDate.getMonth();
  const d = baseDate.getDate();
  
  return [
    { id: '1', title: 'Team Retreat', start: new Date(y, m, d - 2), end: new Date(y, m, d), color: 'bg-purple-200 text-purple-800', isAllDay: true, location: 'Lake Tahoe', status: 'confirmed', priority: 'high', tags: ['work'] },
    { id: '2', title: 'Lunch with Sarah', start: new Date(y, m, d, 12, 30), end: new Date(y, m, d, 13, 30), color: 'bg-teal-200 text-teal-800', location: 'Sushi Place', status: 'confirmed', priority: 'medium', tags: ['personal'] },
    { id: '3', title: 'Project Review', start: new Date(y, m, d + 1, 14, 0), end: new Date(y, m, d + 1, 15, 0), color: 'bg-pink-200 text-pink-800', status: 'tentative', priority: 'high', bufferMinutes: 15 },
    { id: '4', title: 'Gym', start: new Date(y, m, d - 1, 18, 0), end: new Date(y, m, d - 1, 19, 30), color: 'bg-blue-200 text-blue-800', tags: ['health'], status: 'confirmed' },
  ];
};

const CalendarPage: React.FC<CalendarPageProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showViewMenu, setShowViewMenu] = useState(false);
  
  // Interaction States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<Event | null>(null);
  const [quickAddText, setQuickAddText] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Drag & Drop States
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<'move' | 'resize' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [formTab, setFormTab] = useState<'general' | 'details' | 'settings'>('general');
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({
    title: '',
    color: 'bg-purple-200 text-purple-800',
    status: 'confirmed',
    priority: 'medium',
    isAllDay: false,
    bufferMinutes: 0
  });

  // Events State
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const stored = localStorage.getItem('temori_events');
      if (stored) {
        return JSON.parse(stored).map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        }));
      }
    } catch (e) { console.error(e); }
    return generateMockEvents(new Date());
  });

  useEffect(() => { localStorage.setItem('temori_events', JSON.stringify(events)); }, [events]);

  // --- Handlers ---
  const handleQuickAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickAddText.trim()) return;
      const parsed = parseNaturalLanguage(quickAddText);
      const newEvent: Event = {
          id: Date.now().toString(),
          title: parsed.title || 'New Event',
          start: parsed.start!,
          end: parsed.end!,
          isAllDay: parsed.isAllDay,
          color: 'bg-teal-200 text-teal-800',
          status: 'confirmed',
          priority: 'medium'
      };
      setEvents(prev => [...prev, newEvent]);
      setQuickAddText('');
  };

  const handleSaveEvent = () => {
     if (!editingEvent.title || !editingEvent.start || !editingEvent.end) return;
     
     const newEvent = { 
         ...editingEvent, 
         id: editingEvent.id || Date.now().toString() 
     } as Event;

     if (editingEvent.id) {
         setEvents(prev => prev.map(e => e.id === newEvent.id ? newEvent : e));
     } else {
         setEvents(prev => [...prev, newEvent]);
     }
     setIsCreateModalOpen(false);
  };

  const handleDeleteSelected = () => {
      if (confirm(`Delete ${selectedEvents.length} events?`)) {
          setEvents(prev => prev.filter(e => !selectedEvents.includes(e.id)));
          setSelectedEvents([]);
          setIsSelectionMode(false);
      }
  };

  const handleCopy = () => {
      if (selectedEvents.length === 1) {
          const evt = events.find(e => e.id === selectedEvents[0]);
          if (evt) setClipboard(evt);
          setSelectedEvents([]);
          setIsSelectionMode(false);
      }
  };

  const handlePaste = () => {
      if (!clipboard) return;
      // Paste at current date 9 AM
      const start = new Date(currentDate);
      start.setHours(9, 0, 0, 0);
      const duration = clipboard.end.getTime() - clipboard.start.getTime();
      const end = new Date(start.getTime() + duration);
      
      const newEvent = { ...clipboard, id: Date.now().toString(), start, end, title: `${clipboard.title} (Copy)` };
      setEvents(prev => [...prev, newEvent]);
  };

  const checkConflicts = (currentEvent: Event) => {
      return events.filter(e => 
          e.id !== currentEvent.id &&
          !e.isAllDay &&
          !currentEvent.isAllDay &&
          ((currentEvent.start < e.end && currentEvent.end > e.start))
      ).length > 0;
  };

  // --- Render Helpers ---
  const getIconForEvent = (event: Event) => {
      const t = event.title.toLowerCase();
      if (t.includes('gym') || t.includes('workout')) return <Dumbbell size={12} />;
      if (t.includes('lunch') || t.includes('dinner')) return <Utensils size={12} />;
      if (t.includes('coffee')) return <Coffee size={12} />;
      if (t.includes('meeting')) return <Briefcase size={12} />;
      if (t.includes('drive') || t.includes('travel')) return <Car size={12} />;
      return null;
  };

  // --- Drag & Drop Implementation for Grid ---
  // Simplified logic: dragging updates the state, onMouseUp commits it.
  const handleGridMouseDown = (e: React.MouseEvent, eventId: string, action: 'move' | 'resize') => {
      if (isSelectionMode) {
          e.stopPropagation();
          toggleSelection(eventId);
          return;
      }
      e.stopPropagation();
      setDraggedEventId(eventId);
      setDragAction(action);
  };

  const handleGridMouseMove = (e: React.MouseEvent, timeSlot: Date) => {
      if (!draggedEventId || !dragAction) return;
      
      setEvents(prev => prev.map(evt => {
          if (evt.id !== draggedEventId) return evt;
          
          if (dragAction === 'move') {
              const duration = evt.end.getTime() - evt.start.getTime();
              const newStart = new Date(timeSlot);
              // Snap to 15 mins
              const remainder = newStart.getMinutes() % 15;
              newStart.setMinutes(newStart.getMinutes() - remainder);
              const newEnd = new Date(newStart.getTime() + duration);
              return { ...evt, start: newStart, end: newEnd };
          } 
          
          if (dragAction === 'resize') {
              const newEnd = new Date(timeSlot);
              // Minimum 15 mins
              if (newEnd.getTime() - evt.start.getTime() < 15 * 60000) return evt;
              return { ...evt, end: newEnd };
          }
          return evt;
      }));
  };

  const handleGridMouseUp = () => {
      setDraggedEventId(null);
      setDragAction(null);
  };

  const toggleSelection = (id: string) => {
      setSelectedEvents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- Renderers ---
  const renderTimeGridView = (daysToShow: number) => {
    const start = addDays(startOfWeek(new Date(currentDate)), daysToShow === 5 ? 1 : 0);
    const viewDates = Array.from({ length: daysToShow }, (_, i) => addDays(start, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div 
        className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-320px)] overflow-hidden select-none"
        onMouseUp={handleGridMouseUp}
        onMouseLeave={handleGridMouseUp}
      >
        {/* Header */}
        <div className="flex border-b border-gray-200 bg-purple-50/30">
          <div className="w-14 flex-shrink-0 border-r border-gray-100"></div> 
          {viewDates.map((date, i) => (
             <div key={i} className={`flex-1 py-2 text-center border-r border-gray-100 ${isSameDay(date, new Date()) ? 'bg-brand-primary/5' : ''}`}>
                <div className="text-xs text-gray-500 font-bold uppercase">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className={`text-lg font-bold ${isSameDay(date, new Date()) ? 'text-brand-primary' : 'text-gray-800'}`}>{date.getDate()}</div>
             </div>
          ))}
        </div>

        {/* All Day */}
        <div className="flex border-b border-gray-200 bg-gray-50 min-h-[2rem]">
             <div className="w-14 flex-shrink-0 border-r border-gray-100 flex items-center justify-center p-1 text-[10px] text-gray-400 font-bold">ALL DAY</div>
             {viewDates.map((date, i) => (
                <div key={i} className="flex-1 border-r border-gray-100 p-1 flex flex-col gap-1">
                    {events.filter(e => e.isAllDay && isSameDay(e.start, date)).map(e => (
                        <div key={e.id} className={`${e.color} text-[10px] px-1 rounded truncate font-bold border border-black/5`}>{e.title}</div>
                    ))}
                </div>
             ))}
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto relative" ref={gridRef}>
           <div className="flex relative">
              {/* Time Labels */}
              <div className="w-14 flex-shrink-0 border-r border-gray-100 bg-gray-50/50">
                 {hours.map(h => (
                    <div key={h} className="h-16 border-b border-gray-100 text-[10px] text-gray-400 text-right pr-2 pt-1">
                       {h === 0 ? '12 AM' : (h < 12 ? `${h} AM` : (h === 12 ? '12 PM' : `${h-12} PM`))}
                    </div>
                 ))}
              </div>

              {/* Columns */}
              {viewDates.map((date, colIndex) => {
                 const dayEvents = events.filter(e => !e.isAllDay && isSameDay(e.start, date));
                 return (
                    <div 
                        key={colIndex} 
                        className="flex-1 border-r border-gray-100 relative min-w-[100px]"
                        onMouseMove={(e) => {
                            // Calculate approximate time slot under mouse
                            const rect = e.currentTarget.getBoundingClientRect();
                            const y = e.clientY - rect.top + e.currentTarget.scrollTop; // Simplified
                            const hour = Math.floor(y / 64);
                            const minute = Math.floor((y % 64) / 16) * 15;
                            const slot = new Date(date);
                            slot.setHours(hour, minute);
                            handleGridMouseMove(e, slot);
                        }}
                    >
                       {hours.map(h => <div key={h} className="h-16 border-b border-gray-100" />)}
                       
                       {dayEvents.map(e => {
                          const top = (e.start.getHours() * 64) + (e.start.getMinutes() / 60 * 64);
                          const durationHrs = (e.end.getTime() - e.start.getTime()) / 3600000;
                          const height = Math.max(durationHrs * 64, 20);
                          const isConflict = checkConflicts(e);
                          const isSelected = selectedEvents.includes(e.id);

                          return (
                             <div 
                                key={e.id}
                                onMouseDown={(ev) => handleGridMouseDown(ev, e.id, 'move')}
                                className={`absolute left-0.5 right-0.5 rounded-md text-xs overflow-hidden border-l-4 transition-all z-10 
                                    ${e.color} ${isConflict ? 'ring-2 ring-red-400' : ''} ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg' : 'shadow-sm'}
                                    ${e.status === 'cancelled' ? 'opacity-50 grayscale' : ''}
                                    ${e.status === 'tentative' ? 'bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)]' : ''}
                                `}
                                style={{ top: `${top}px`, height: `${height}px` }}
                             >
                                {/* Buffer Time Visualization */}
                                {e.bufferMinutes && (
                                    <div className="absolute top-0 left-0 w-full bg-black/10" style={{ height: `${(e.bufferMinutes / 60) * 64}px` }} />
                                )}

                                <div className="p-1.5 h-full flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold truncate flex items-center gap-1">
                                            {e.priority === 'high' && <Flag size={10} className="text-red-600 fill-red-600" />}
                                            {getIconForEvent(e)}
                                            {e.title}
                                        </div>
                                        {e.isPrivate && <EyeOff size={10} className="opacity-50" />}
                                    </div>
                                    <div className="opacity-80 text-[10px]">{formatTime(e.start)} - {formatTime(e.end)}</div>
                                </div>
                                
                                {/* Resize Handle */}
                                <div 
                                    className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize hover:bg-black/10 flex justify-center items-end pb-0.5"
                                    onMouseDown={(ev) => handleGridMouseDown(ev, e.id, 'resize')}
                                >
                                    <div className="w-8 h-1 bg-white/40 rounded-full" />
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 );
              })}
           </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getDayOfWeek(year, month, 1);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 select-none">
        <div className="grid grid-cols-7 bg-purple-50/50 border-b border-gray-200">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="py-2 text-center text-xs font-bold text-gray-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({length: startDay}).map((_, i) => <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-100" />)}
          {Array.from({length: daysInMonth}).map((_, i) => {
              const d = i + 1;
              const date = new Date(year, month, d);
              const dayEvents = events.filter(e => isSameDay(e.start, date));
              const isToday = isSameDay(date, new Date());
              return (
                  <div key={d} className="min-h-[6rem] p-1 border-b border-r border-gray-100 transition-colors hover:bg-purple-50"
                      onClick={() => {
                           if (isSelectionMode) return;
                           setEditingEvent({ start: date, end: date, title: '', isAllDay: true, color: 'bg-purple-200 text-purple-800' });
                           setIsCreateModalOpen(true);
                      }}
                  >
                      <div className="flex justify-center mb-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-brand-primary text-white' : 'text-gray-700'}`}>{d}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                          {dayEvents.slice(0, 3).map(e => (
                              <div key={e.id} 
                                   onClick={(ev) => {
                                       ev.stopPropagation();
                                       if (isSelectionMode) toggleSelection(e.id);
                                       else {
                                           setEditingEvent(e);
                                           setIsCreateModalOpen(true);
                                       }
                                   }}
                                   className={`text-[9px] truncate px-1 py-0.5 rounded-sm font-medium ${e.color} cursor-pointer ${selectedEvents.includes(e.id) ? 'ring-2 ring-blue-400' : ''}`}
                              >
                                  {e.title}
                              </div>
                          ))}
                          {dayEvents.length > 3 && <div className="text-[9px] text-gray-400 text-center">+{dayEvents.length - 3} more</div>}
                      </div>
                  </div>
              );
          })}
        </div>
      </div>
    );
  };

  // --- UI Components ---

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5F9] relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#5D3F6A] text-white p-4 pt-8 rounded-b-[2rem] shadow-xl z-20 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={20} /></button>
          <div className="flex flex-col items-center">
             <h1 className="font-cursive text-xl tracking-wide opacity-90">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
             </h1>
          </div>
          <div className="flex gap-2">
              {clipboard && <button onClick={handlePaste} className="p-2 bg-white/20 rounded-full" title="Paste"><Copy size={16} /></button>}
              <button onClick={() => setIsSelectionMode(!isSelectionMode)} className={`p-2 rounded-full transition-colors ${isSelectionMode ? 'bg-brand-primary' : 'bg-white/10'}`}>
                  <MousePointer2 size={16} />
              </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <button onClick={() => setCurrentDate(prev => currentView === 'month' ? addMonths(prev, -1) : addDays(prev, -7))} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold tracking-wide text-brand-accent/90">
             {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentDate(prev => currentView === 'month' ? addMonths(prev, 1) : addDays(prev, 7))} className="p-1 hover:bg-white/10 rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedEvents.length > 0 && (
          <div className="bg-brand-primary text-white p-3 flex items-center justify-between px-6 animate-fade-in shadow-md z-10">
              <span className="font-bold">{selectedEvents.length} Selected</span>
              <div className="flex gap-4">
                  <button onClick={handleCopy} className="flex items-center gap-1 hover:text-purple-200"><Copy size={16}/> Copy</button>
                  <button onClick={handleDeleteSelected} className="flex items-center gap-1 hover:text-red-200"><Trash size={16}/> Delete</button>
                  <button onClick={() => {setSelectedEvents([]); setIsSelectionMode(false)}}><XCircle size={16}/></button>
              </div>
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-hidden flex flex-col relative z-10">
         {currentView === 'month' && renderMonthView()}
         {(currentView === 'week' || currentView === 'workweek' || currentView === 'day' || currentView === '3day') && 
            renderTimeGridView(currentView === 'week' ? 7 : (currentView === 'workweek' ? 5 : (currentView === '3day' ? 3 : 1)))
         }
      </div>

      {/* Quick Add Bar */}
      <div className="fixed bottom-24 left-4 right-4 z-30">
         <form onSubmit={handleQuickAdd} className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 flex gap-2">
            <div className="bg-brand-primary/10 p-2 rounded-xl text-brand-primary"><Plus size={20} /></div>
            <input 
                type="text" 
                placeholder="Ex: Lunch with John tomorrow 1pm..." 
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                value={quickAddText}
                onChange={e => setQuickAddText(e.target.value)}
            />
            <button type="submit" className="bg-brand-primary text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-md">Add</button>
         </form>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-40">
         <button onClick={() => { setEditingEvent({ start: new Date(), end: addDays(new Date(), 0), color: 'bg-purple-200 text-purple-800', isAllDay: false }); setIsCreateModalOpen(true); }} className="bg-brand-primary text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-[#3d8c8c] flex items-center gap-2">
            <Plus size={20} /> New
         </button>
         <div className="flex items-center gap-2 bg-[#4A3055] p-2 rounded-full shadow-2xl border border-white/10">
            <button onClick={() => setShowViewMenu(!showViewMenu)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
               <LayoutGrid size={24} />
            </button>
         </div>
      </div>

      {/* View Menu */}
      {showViewMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowViewMenu(false)}>
           <div className="absolute bottom-24 right-6 bg-white p-4 rounded-2xl shadow-xl w-48 flex flex-col gap-2 animate-bounce-in">
              {['month','week','day','3day','workweek'].map(v => (
                  <button key={v} onClick={() => { setCurrentView(v as ViewType); setShowViewMenu(false); }} className={`p-2 rounded-lg text-left capitalize ${currentView === v ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-50'}`}>
                      {v} View
                  </button>
              ))}
           </div>
        </div>
      )}

      {/* Advanced Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col animate-zoom-in overflow-hidden">
                <div className="bg-[#5D3F6A] p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-lg font-bold font-cursive">{editingEvent.id ? 'Edit Event' : 'New Event'}</h3>
                    <button onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-4 pt-2 gap-4 bg-gray-50 shrink-0">
                    {['general', 'details', 'settings'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setFormTab(tab as any)}
                            className={`pb-2 text-sm font-bold capitalize border-b-2 transition-colors ${formTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                    
                    {/* General Tab */}
                    {formTab === 'general' && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Event Title" 
                                value={editingEvent.title}
                                onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                                className="text-2xl font-bold outline-none placeholder-gray-300 w-full border-b border-gray-100 pb-2 focus:border-brand-primary"
                                autoFocus
                            />
                            
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400">Start</label>
                                    <input 
                                        type="datetime-local" 
                                        value={editingEvent.start ? new Date(editingEvent.start.getTime() - (editingEvent.start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                        onChange={e => setEditingEvent({...editingEvent, start: new Date(e.target.value)})}
                                        className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-100"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400">End</label>
                                    <input 
                                        type="datetime-local" 
                                        value={editingEvent.end ? new Date(editingEvent.end.getTime() - (editingEvent.end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                        onChange={e => setEditingEvent({...editingEvent, end: new Date(e.target.value)})}
                                        className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-gray-600"><Clock size={16} /> <span className="text-sm">All Day</span></div>
                                <button onClick={() => setEditingEvent({...editingEvent, isAllDay: !editingEvent.isAllDay})}>
                                    {editingEvent.isAllDay ? <ToggleRight size={28} className="text-brand-primary" /> : <ToggleLeft size={28} className="text-gray-300" />}
                                </button>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Add Location"
                                    value={editingEvent.location || ''}
                                    onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                                    className="bg-transparent outline-none text-sm w-full"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 mb-2 block">Color</label>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {['bg-purple-200 text-purple-800', 'bg-teal-200 text-teal-800', 'bg-pink-200 text-pink-800', 'bg-blue-200 text-blue-800', 'bg-orange-200 text-orange-800'].map(c => (
                                        <button 
                                            key={c} 
                                            onClick={() => setEditingEvent({...editingEvent, color: c})}
                                            className={`w-8 h-8 rounded-full ${c.split(' ')[0]} border-2 ${editingEvent.color === c ? 'border-gray-600' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Templates Dropdown */}
                            <div className="mt-2">
                                <label className="text-xs font-bold text-gray-400 mb-1 block">Templates</label>
                                <select 
                                    className="w-full p-2 bg-gray-50 rounded-lg text-sm border border-gray-100"
                                    onChange={(e) => {
                                        if(!e.target.value) return;
                                        const now = new Date();
                                        if (e.target.value === 'standup') setEditingEvent(prev => ({ ...prev, title: 'Daily Standup', color: 'bg-blue-200 text-blue-800', start: now, end: new Date(now.getTime() + 15*60000) }));
                                        if (e.target.value === 'lunch') setEditingEvent(prev => ({ ...prev, title: 'Lunch Break', color: 'bg-orange-200 text-orange-800', start: now, end: new Date(now.getTime() + 60*60000) }));
                                    }}
                                >
                                    <option value="">Select a template...</option>
                                    <option value="standup">Daily Standup (15m)</option>
                                    <option value="lunch">Lunch Break (1h)</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Details Tab */}
                    {formTab === 'details' && (
                        <>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2"><FileText size={16} /> Description</label>
                                <textarea 
                                    value={editingEvent.description || ''}
                                    onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                                    className="w-full bg-gray-50 p-3 rounded-xl text-sm border border-gray-100 h-24 resize-none outline-none focus:border-brand-primary"
                                    placeholder="Add notes, agenda, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2"><Paperclip size={16} /> Attachments (Links)</label>
                                <input 
                                    type="text" 
                                    placeholder="Paste URL here..."
                                    className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-100 mb-2"
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value;
                                            if(val) setEditingEvent(prev => ({...prev, attachments: [...(prev.attachments || []), val]}));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <div className="flex flex-col gap-1">
                                    {editingEvent.attachments?.map((link, i) => (
                                        <div key={i} className="text-xs text-blue-500 truncate bg-blue-50 p-1 rounded px-2">{link}</div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2"><Users size={16} /> Participants</label>
                                <input 
                                    type="text" 
                                    placeholder="Add name and press Enter..."
                                    className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-100 mb-2"
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value;
                                            if(val) setEditingEvent(prev => ({...prev, participants: [...(prev.participants || []), val]}));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {editingEvent.participants?.map((p, i) => (
                                        <div key={i} className="text-xs bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
                                            {p} <button onClick={() => setEditingEvent(prev => ({...prev, participants: prev.participants?.filter((_, idx) => idx !== i)}))}><X size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2"><Tag size={16} /> Categories / Tags</label>
                                <div className="flex gap-2">
                                    {['Work', 'Personal', 'Health', 'Finance'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => {
                                                const tags = editingEvent.tags || [];
                                                setEditingEvent({...editingEvent, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]});
                                            }}
                                            className={`text-xs px-3 py-1 rounded-full border ${editingEvent.tags?.includes(tag) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Settings Tab */}
                    {formTab === 'settings' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2"><Eye size={16}/> Private Event</span>
                                <button onClick={() => setEditingEvent({...editingEvent, isPrivate: !editingEvent.isPrivate})}>
                                    {editingEvent.isPrivate ? <ToggleRight size={28} className="text-brand-primary" /> : <ToggleLeft size={28} className="text-gray-300" />}
                                </button>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2"><CheckSquare size={16}/> Status</span>
                                <div className="flex gap-2">
                                    {(['confirmed', 'tentative', 'cancelled'] as EventStatus[]).map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setEditingEvent({...editingEvent, status: s})}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize ${editingEvent.status === s ? 'bg-brand-primary text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2"><Flag size={16}/> Priority</span>
                                <div className="flex gap-2">
                                    {(['low', 'medium', 'high'] as EventPriority[]).map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setEditingEvent({...editingEvent, priority: p})}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize ${editingEvent.priority === p ? (p === 'high' ? 'bg-red-500 text-white' : (p === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white')) : 'bg-white border border-gray-200 text-gray-500'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2"><Car size={16}/> Travel Buffer (mins)</span>
                                <input 
                                    type="number" 
                                    value={editingEvent.bufferMinutes || 0}
                                    onChange={e => setEditingEvent({...editingEvent, bufferMinutes: parseInt(e.target.value)})}
                                    className="w-full p-2 rounded-lg border border-gray-200"
                                />
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2"><Bell size={16}/> Reminders</span>
                                <select className="w-full p-2 rounded-lg border border-gray-200 bg-white">
                                    <option>None</option>
                                    <option>5 minutes before</option>
                                    <option>1 hour before</option>
                                    <option>1 day before</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 shrink-0">
                    <button onClick={handleSaveEvent} className="w-full bg-[#5D3F6A] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#4A3055] flex items-center justify-center gap-2">
                        <Save size={18} /> Save Event
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CalendarPage;