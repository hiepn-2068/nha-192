import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Circle, Plus, Trash2, ShoppingBag, Sparkles, Shirt, 
  UtensilsCrossed, Home, Package, CheckSquare, TrendingUp, Search, 
  UserCheck, LogOut, LogIn, Key, Copy, Check, House, RefreshCw, 
  Briefcase, UserX, CalendarClock, X, Edit3, UserPlus, Camera,
  Trophy, Star, Flame, Gift, Clock, AlertTriangle, ChevronRight,
  BarChart3, MessageSquare, Download, Upload, SlidersHorizontal,
  CheckCheck, Award, Eye, Heart, Pin, ArrowUpDown, ChevronDown
} from 'lucide-react';

// --- DANH MỤC CÔNG VIỆC ---
const CATEGORIES = [
  { id: 'grocery', name: 'Đi chợ & Lương thực', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  { id: 'supplies', name: 'Nhu yếu phẩm', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { id: 'cleaning', name: 'Quét & Lau nhà', icon: Sparkles, color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
  { id: 'laundry', name: 'Giặt & Phơi đồ', icon: Shirt, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 'dishes', name: 'Rửa bát & Dọn bếp', icon: UtensilsCrossed, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  { id: 'general', name: 'Vệ sinh chung', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' }
];

const PRIORITIES = {
  high: { label: 'Gấp', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Vừa', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Thong thả', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', dot: 'bg-slate-400' }
};

const DEFAULT_MEMBERS = [
  { id: '1', name: 'Mẹ Thu Hà', presence: 'home', points: 140, streak: 5 },
  { id: '2', name: 'Bố Đức Minh', presence: 'home', points: 95, streak: 3 },
  { id: '3', name: 'Con Minh Anh', presence: 'home', points: 120, streak: 7 }
];

const DEFAULT_REWARDS = [
  { id: 'r1', title: '1 Ly Trà sữa / Cà phê yêu thích', points: 30, icon: '🧋', redeemedCount: 4 },
  { id: 'r2', title: 'Thêm 45 phút chơi game / xem TV', points: 25, icon: '🎮', redeemedCount: 8 },
  { id: 'r3', title: 'Được miễn 1 buổi rửa bát', points: 45, icon: '✨', redeemedCount: 2 },
  { id: 'r4', title: 'Tự chọn món cho bữa tối gia đình', points: 40, icon: '🍕', redeemedCount: 5 },
  { id: 'r5', title: 'Chuyến đi chơi công viên / xem phim cuối tuần', points: 100, icon: '🎬', redeemedCount: 1 }
];

const readStored = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_NOTES = [
  { id: 'n1', authorName: 'Mẹ Thu Hà', text: 'Canh rau ngót nấu thịt băm trong nồi cơm nhé, ai về sớm nhớ cắm lại cơm!', color: 'bg-amber-50 text-amber-900 border-amber-200', time: '08:30 Hôm nay' },
  { id: 'n2', authorName: 'Bố Đức Minh', text: 'Bố đã mua thêm túi rác và nước rửa bát để dưới bồn rửa chén rồi nhé.', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', time: '10:15 Hôm nay' }
];

export default function App() {
  // --- TABS & NAVIGATION ---
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'presence' | 'rewards' | 'fridge' | 'stats'

  // --- PERSISTENT STATES ---
  const [tasks, setTasks] = useState(() => {
    const parsed = readStored('chore_tasks', null);
    if (Array.isArray(parsed)) return parsed.map(t => ({
      ...t, points: t.points || 10, priority: t.priority || 'medium', subtasks: t.subtasks || []
    }));
    return [
      {
        id: 'demo-1',
        title: 'Đi chợ mua thực phẩm cuối tuần',
        category: 'grocery',
        assigneeId: '1',
        note: 'Mua ở chợ đầu mối cho tươi nhé',
        completed: false,
        priority: 'high',
        points: 20,
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: [
          { id: 'st1', text: '500g sườn non', completed: true },
          { id: 'st2', text: '1 bó rau muống & mớ ngò', completed: false },
          { id: 'st3', text: '1 chục trứng gà sạch', completed: false }
        ]
      },
      {
        id: 'demo-2',
        title: 'Hút bụi & lau sàn phòng khách',
        category: 'cleaning',
        assigneeId: '3',
        note: 'Lau kỹ cả góc sofa',
        completed: true,
        priority: 'medium',
        points: 15,
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
      },
      {
        id: 'demo-3',
        title: 'Rửa bát và dọn bàn bếp trưa',
        category: 'dishes',
        assigneeId: '2',
        note: 'Nhớ phơi giẻ lau bếp',
        completed: false,
        priority: 'medium',
        points: 10,
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: []
      }
    ];
  });

  const [members, setMembers] = useState(() => {
    const parsed = readStored('chore_members', DEFAULT_MEMBERS);
    return Array.isArray(parsed) ? parsed.map(m => ({ ...m, points: m.points ?? 50, streak: m.streak ?? 1 })) : DEFAULT_MEMBERS;
  });

  const [rewards, setRewards] = useState(() => {
    const saved = readStored('chore_rewards', DEFAULT_REWARDS);
    return Array.isArray(saved) ? saved : DEFAULT_REWARDS;
  });

  const [notes, setNotes] = useState(() => {
    const saved = readStored('chore_notes', DEFAULT_NOTES);
    return Array.isArray(saved) ? saved : DEFAULT_NOTES;
  });

  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState(() => {
    return readStored('chore_current_user', null);
  });
  const [authInputName, setAuthInputName] = useState('');

  // --- MODALS & FORMS ---
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isReportingSchedule, setIsReportingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ departureTime: '', returnTime: '', note: '' });

  // Task Form State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: CATEGORIES[0].id,
    assigneeId: '',
    note: '',
    priority: 'medium',
    points: 10,
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: []
  });
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Sticky Note Form
  const [newNoteText, setNewNoteText] = useState('');

  // Reward Form
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [rewardForm, setRewardForm] = useState({ title: '', points: 25, icon: '🎁' });

  // Lightbox Preview
  const [previewImage, setPreviewImage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [filterPriority, setFilterPriority] = useState('all');

  // Canvas Confetti Ref
  const canvasRef = useRef(null);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('chore_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chore_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('chore_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('chore_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chore_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('chore_current_user');
    }
  }, [currentUser]);

  // Keep currentUser in sync with members list (points, status)
  useEffect(() => {
    if (currentUser) {
      const updated = members.find(m => m.id === currentUser.id);
      if (updated && (updated.points !== currentUser.points || updated.presence !== currentUser.presence)) {
        setCurrentUser(updated);
      }
    }
  }, [members, currentUser]);

  // --- CONFETTI ANIMATION ---
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vr;
        p.alpha -= 0.015;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });
      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  };

  // --- AUTH HANDLERS ---
  const handleLoginWithName = (e) => {
    e.preventDefault();
    if (!authInputName.trim()) return;
    const name = authInputName.trim();
    let existing = members.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      existing = { id: Date.now().toString(), name, presence: 'home', points: 50, streak: 1 };
      setMembers(prev => [...prev, existing]);
    }
    setCurrentUser(existing);
    setAuthInputName('');
  };

  const handleLogout = () => setCurrentUser(null);

  // --- MEMBER MANAGEMENT ---
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      presence: 'home',
      points: 50,
      streak: 1
    };
    setMembers(prev => [...prev, newMember]);
    setNewMemberName('');
  };

  const handleDeleteMember = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
      if (currentUser?.id === id) setCurrentUser(null);
    }
  };

  // --- PRESENCE HANDLERS ---
  const handleUpdatePresence = (status) => {
    if (!currentUser) return;
    if (status === 'work') {
      setIsReportingSchedule(true);
      return;
    }
    setIsReportingSchedule(false);
    setMembers(prev => prev.map(m => {
      if (m.id === currentUser.id) {
        return status === 'home'
          ? { ...m, presence: status, departureTime: null, returnTime: null, note: null }
          : { ...m, presence: status };
      }
      return m;
    }));
  };

  const handleSubmitSchedule = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setMembers(prev => prev.map(m =>
      m.id === currentUser.id ? {
        ...m,
        presence: 'work',
        departureTime: scheduleForm.departureTime,
        returnTime: scheduleForm.returnTime,
        note: scheduleForm.note
      } : m
    ));
    setIsReportingSchedule(false);
    setScheduleForm({ departureTime: '', returnTime: '', note: '' });
  };

  const handleClearSchedule = (memberId) => {
    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, presence: 'home', departureTime: null, returnTime: null, note: null } : m
    ));
  };

  // --- TASK MANAGEMENT ---
  const handleOpenAddTask = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      category: CATEGORIES[0].id,
      assigneeId: currentUser ? currentUser.id : '',
      note: '',
      priority: 'medium',
      points: 10,
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: []
    });
    setNewSubtaskInput('');
    setIsAddingTask(true);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      category: task.category,
      assigneeId: task.assigneeId || '',
      note: task.note || '',
      priority: task.priority || 'medium',
      points: task.points || 10,
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      subtasks: task.subtasks ? [...task.subtasks] : []
    });
    setNewSubtaskInput('');
    setIsAddingTask(true);
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;

    if (editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? {
        ...t,
        title: taskForm.title.trim(),
        category: taskForm.category,
        assigneeId: taskForm.assigneeId,
        note: taskForm.note.trim(),
        priority: taskForm.priority,
        points: Number(taskForm.points) || 10,
        dueDate: taskForm.dueDate,
        subtasks: taskForm.subtasks
      } : t));
    } else {
      const newTask = {
        id: Date.now().toString(),
        title: taskForm.title.trim(),
        category: taskForm.category,
        assigneeId: taskForm.assigneeId,
        note: taskForm.note.trim(),
        priority: taskForm.priority,
        points: Number(taskForm.points) || 10,
        dueDate: taskForm.dueDate,
        subtasks: taskForm.subtasks,
        completed: false,
        imageProof: null,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
    }

    setIsAddingTask(false);
    setEditingTaskId(null);
  };

  const toggleTask = (task) => {
    const isNowCompleted = !task.completed;
    const taskPoints = Number(task.points) || 10;

    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          completed: isNowCompleted,
          // When marking complete, mark all subtasks as well
          subtasks: isNowCompleted && t.subtasks ? t.subtasks.map(s => ({ ...s, completed: true })) : t.subtasks
        };
      }
      return t;
    }));

    // Award / deduct points to assignee
    if (task.assigneeId) {
      setMembers(prev => prev.map(m => {
        if (m.id === task.assigneeId) {
          const newPts = isNowCompleted ? (m.points || 0) + taskPoints : Math.max(0, (m.points || 0) - taskPoints);
          return { ...m, points: newPts };
        }
        return m;
      }));
    }

    if (isNowCompleted) {
      fireConfetti();
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const updatedSubtasks = (target.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const nextCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, subtasks: updatedSubtasks, completed: nextCompleted }
      : t
    ));
    if (target.completed !== nextCompleted && target.assigneeId) {
      const delta = Number(target.points) || 10;
      setMembers(prev => prev.map(m => m.id === target.assigneeId
        ? { ...m, points: Math.max(0, (m.points || 0) + (nextCompleted ? delta : -delta)) }
        : m
      ));
    }
    if (nextCompleted && !target.completed) fireConfetti();
  };

  const handleAddSubtaskToForm = (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    const newSt = {
      id: Date.now().toString(),
      text: newSubtaskInput.trim(),
      completed: false
    };
    setTaskForm(prev => ({ ...prev, subtasks: [...prev.subtasks, newSt] }));
    setNewSubtaskInput('');
  };

  const handleRemoveSubtaskFromForm = (subtaskId) => {
    setTaskForm(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
    }));
  };

  const deleteTask = (id) => {
    if (confirm('Xóa công việc này khỏi danh sách?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUploadProof = (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh < 2.5MB!');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const target = tasks.find(t => t.id === taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        imageProof: reader.result,
        completed: true,
        subtasks: (t.subtasks || []).map(st => ({ ...st, completed: true }))
      } : t));
      if (target && !target.completed && target.assigneeId) {
        const points = Number(target.points) || 10;
        setMembers(prev => prev.map(m => m.id === target.assigneeId ? { ...m, points: (m.points || 0) + points } : m));
      }
      if (target && !target.completed) fireConfetti();
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const removeImageProof = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, imageProof: null } : t));
  };

  // --- SMART AUTO-ASSIGNMENT ---
  const handleAutoAssign = () => {
    const unassignedTasks = tasks.filter(t => !t.completed && !t.assigneeId);
    if (unassignedTasks.length === 0) {
      alert('Không có công việc nào chưa có người nhận!');
      return;
    }

    const homeMembers = members.filter(m => m.presence === 'home');
    const pool = homeMembers.length > 0 ? homeMembers : members;

    if (pool.length === 0) {
      alert('Chưa có thành viên nào để phân công!');
      return;
    }

    let memberIndex = 0;
    setTasks(prev => prev.map(t => {
      if (!t.completed && !t.assigneeId) {
        const assignedMember = pool[memberIndex % pool.length];
        memberIndex++;
        return { ...t, assigneeId: assignedMember.id };
      }
      return t;
    }));

    alert(`Đã tự động chia đều ${unassignedTasks.length} việc cho các thành viên! 🎯`);
  };

  // --- REWARD SHOP HANDLERS ---
  const handleRedeemReward = (reward) => {
    if (!currentUser) return;
    if ((currentUser.points || 0) < reward.points) {
      alert(`Bạn còn thiếu ${reward.points - (currentUser.points || 0)} điểm để đổi món này. Hãy làm thêm việc nhà nhé! 💪`);
      return;
    }

    if (confirm(`Bạn muốn dùng ${reward.points} điểm để đổi "${reward.title}"?`)) {
      setMembers(prev => prev.map(m => {
        if (m.id === currentUser.id) {
          return { ...m, points: (m.points || 0) - reward.points };
        }
        return m;
      }));

      setRewards(prev => prev.map(r => {
        if (r.id === reward.id) {
          return { ...r, redeemedCount: (r.redeemedCount || 0) + 1 };
        }
        return r;
      }));

      fireConfetti();
      alert(`🎉 Chúc mừng ${currentUser.name}! Bạn đã đổi thành công phần thưởng!`);
    }
  };

  const handleAddReward = (e) => {
    e.preventDefault();
    if (!rewardForm.title.trim()) return;
    const newRw = {
      id: Date.now().toString(),
      title: rewardForm.title.trim(),
      points: Number(rewardForm.points) || 20,
      icon: rewardForm.icon || '🎁',
      redeemedCount: 0
    };
    setRewards(prev => [...prev, newRw]);
    setIsAddingReward(false);
    setRewardForm({ title: '', points: 25, icon: '🎁' });
  };

  // --- FRIDGE STICKY NOTES ---
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentUser) return;
    const colors = [
      'bg-amber-50 text-amber-900 border-amber-200',
      'bg-sky-50 text-sky-900 border-sky-200',
      'bg-emerald-50 text-emerald-900 border-emerald-200',
      'bg-purple-50 text-purple-900 border-purple-200',
      'bg-rose-50 text-rose-900 border-rose-200'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote = {
      id: Date.now().toString(),
      authorName: currentUser.name,
      text: newNoteText.trim(),
      color: randomColor,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay'
    };
    setNotes(prev => [newNote, ...prev]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // --- BACKUP & RESTORE ---
  const handleExportData = () => {
    const data = { tasks, members, rewards, notes, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nha-cua-minh-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid backup');
        if (Array.isArray(imported.tasks)) setTasks(imported.tasks);
        if (Array.isArray(imported.members)) setMembers(imported.members);
        if (Array.isArray(imported.rewards)) setRewards(imported.rewards);
        if (Array.isArray(imported.notes)) setNotes(imported.notes);
        alert('Khôi phục dữ liệu gia đình thành công! 🎉');
      } catch (err) {
        alert('File dữ liệu không đúng định dạng!');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetSampleData = () => {
    if (confirm('Khôi phục về dữ liệu mẫu ban đầu? Các thay đổi hiện tại sẽ được thay bằng dữ liệu chuẩn.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- COMPUTATIONS & FILTERING ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Keyword search
      const matchesSearch = !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchAssignee = filterAssignee === 'all' || t.assigneeId === filterAssignee;
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;

      let matchStatus = true;
      if (filterStatus === 'pending') matchStatus = !t.completed;
      if (filterStatus === 'completed') matchStatus = t.completed;

      return matchesSearch && matchCategory && matchAssignee && matchPriority && matchStatus;
    });
  }, [tasks, searchQuery, filterCategory, filterAssignee, filterPriority, filterStatus]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  const activeMembersCount = members.filter(m => m.presence === 'home').length;
  const absentMembers = members.filter(m => m.presence !== 'home' && m.departureTime);

  // Leaderboard ranking (sorted by points descending)
  const rankedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [members]);

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 flex items-center justify-center p-4 font-sans antialiased">
        <div className="bg-white rounded-3xl p-6 sm:p-10 w-full max-w-md border border-slate-200/80 shadow-2xl shadow-emerald-500/10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30 transform hover:rotate-6 transition">
              <CheckSquare className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Nhà Của Mình</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Việc nhà thông minh • Điểm danh • Tích điểm đổi quà</p>
          </div>

          {/* Quick Select Member */}
          {members.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Chọn nhanh thành viên:
              </label>
              <div className="space-y-2">
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setCurrentUser(m)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200 group text-left shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-base group-hover:scale-105 transition">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 group-hover:text-emerald-900 text-sm">{m.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" /> {m.points || 0}đ
                          </span>
                          <span>•</span>
                          <span className={m.presence === 'home' ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                            {m.presence === 'home' ? 'Ở nhà' : 'Vắng'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition">
                      Vào ngay →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">Hoặc tạo người dùng mới</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleLoginWithName} className="mt-4 space-y-3">
            <input
              type="text"
              required
              placeholder="Nhập tên của bạn (VD: Hải Nam, Lan Anh...)"
              value={authInputName}
              onChange={e => setAuthInputName(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Đăng nhập / Bắt đầu ngay
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-28">
      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Welcome */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">Nhà Của Mình</h1>
                  <span className="hidden sm:inline-flex text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">v2.0</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>Chào, <strong className="text-emerald-700 font-semibold">{currentUser.name}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {currentUser.points || 0} điểm
                  </span>
                  <span className="hidden sm:flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                    <Flame className="w-3 h-3 fill-rose-500 text-rose-500" /> {currentUser.streak || 1} ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManagingMembers(prev => !prev)}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
                  isManagingMembers ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Quản lý thành viên"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Thành viên ({members.length})</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
                title="Đổi tài khoản"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          </div>

          {/* Quick Progress Bar for the Day */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hôm nay: <strong className="text-slate-800">{completedTasksCount}/{totalTasks}</strong> việc xong ({completionPercentage}%)</span>
            </div>
            <div className="flex-1 max-w-[140px] sm:max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-emerald-600 font-bold hidden sm:inline">{activeMembersCount}/{members.length} đang ở nhà</span>
          </div>
        </div>
      </header>

      {/* TAB NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-[98px] sm:top-[112px] z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2">
          {[
            { id: 'tasks', label: 'Việc nhà', icon: CheckSquare, badge: tasks.filter(t => !t.completed).length },
            { id: 'presence', label: 'Điểm danh & Lịch', icon: House, badge: absentMembers.length > 0 ? absentMembers.length : null },
            { id: 'rewards', label: 'Bảng vàng & Quà', icon: Trophy },
            { id: 'fridge', label: 'Bảng tin dán', icon: Pin, badge: notes.length },
            { id: 'stats', label: 'Thống kê & Sao lưu', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        
        {/* MANAGE MEMBERS MODAL / PANEL */}
        {isManagingMembers && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Danh sách thành viên gia đình</h3>
                <p className="text-xs text-slate-500">Quản lý các thành viên cùng tham gia làm việc nhà</p>
              </div>
              <button
                onClick={() => setIsManagingMembers(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Thêm tên thành viên mới (VD: Bé Bo, Bà nội...)"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
              >
                Thêm
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">
                        {member.name} {member.id === currentUser.id && <span className="text-emerald-600 font-normal">(Bạn)</span>}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-amber-500 font-semibold">{member.points || 0} điểm</span>
                        <span>•</span>
                        <span className={member.presence === 'home' ? 'text-emerald-600' : 'text-slate-400'}>
                          {member.presence === 'home' ? 'Đang ở nhà' : 'Đang vắng'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {member.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: VIỆC NHÀ (CHORE TASKS) */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm công việc theo tên hoặc ghi chú..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {/* Status Filter */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    Tất cả ({tasks.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${filterStatus === 'pending' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Chưa xong ({tasks.filter(t => !t.completed).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${filterStatus === 'completed' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Đã xong ({tasks.filter(t => t.completed).length})
                  </button>
                </div>

                {/* Assignee Filter */}
                <select
                  value={filterAssignee}
                  onChange={e => setFilterAssignee(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">👥 Mọi người</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">📁 Mọi danh mục</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">⚡ Mọi độ ưu tiên</option>
                  <option value="high">🔴 Gấp</option>
                  <option value="medium">🟡 Vừa</option>
                  <option value="low">🟢 Thong thả</option>
                </select>

                {/* Smart Auto Assign Button */}
                <button
                  onClick={handleAutoAssign}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition border border-emerald-200/60"
                  title="Tự động chia đều các việc chưa ai nhận cho người đang ở nhà"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chia việc thông minh</span>
                </button>
              </div>
            </div>

            {/* TASK FORM MODAL / DRAWER */}
            {isAddingTask && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xl animate-in fade-in zoom-in-95 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {editingTaskId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {editingTaskId ? 'Chỉnh sửa công việc' : 'Tạo việc nhà mới'}
                    </h3>
                  </div>
                  <button onClick={() => setIsAddingTask(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên công việc *</label>
                  <input
                    type="text"
                    required
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="VD: Đi chợ nấu cơm chiều, Lau sạch kính ban công..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Danh mục</label>
                    <select
                      value={taskForm.category}
                      onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Giao cho ai</label>
                    <select
                      value={taskForm.assigneeId}
                      onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="">Chưa phân công (Ai cũng được)</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.presence === 'home' ? '(Ở nhà)' : '(Vắng)'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Mức độ ưu tiên</label>
                    <select
                      value={taskForm.priority}
                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="high">🔴 Gấp (Ưu tiên cao)</option>
                      <option value="medium">🟡 Vừa (Bình thường)</option>
                      <option value="low">🟢 Thong thả</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reward Points */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Điểm thưởng hoàn thành ⭐</label>
                    <div className="flex items-center gap-2">
                      {[5, 10, 15, 20, 30].map(pt => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setTaskForm({ ...taskForm, points: pt })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                            taskForm.points === pt
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          +{pt}đ
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Hạn chót</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Subtasks (Checklist / Grocery list) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Mục việc con / Danh sách đồ cần mua (Tùy chọn)
                  </label>
                  
                  {taskForm.subtasks.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {taskForm.subtasks.map((st, idx) => (
                        <div key={st.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                          <span className="font-medium text-slate-700">{idx + 1}. {st.text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtaskFromForm(st.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Thêm mục con (VD: 500g thịt, 1 bó rau, quả chanh...)"
                      value={newSubtaskInput}
                      onChange={e => setNewSubtaskInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtaskToForm(e); } }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtaskToForm}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      + Thêm mục
                    </button>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Ghi chú thêm</label>
                  <textarea
                    rows={2}
                    value={taskForm.note}
                    onChange={e => setTaskForm({ ...taskForm, note: e.target.value })}
                    placeholder="VD: Nhớ khóa van gas cẩn thận, cất chìa khóa vào tủ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveTask}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    {editingTaskId ? 'Cập nhật công việc' : 'Lưu công việc'}
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* TASK LIST */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-700 font-bold text-base">Không có công việc nào phù hợp</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại' : 'Tất cả công việc đã hoàn thành hoặc chưa có việc nào mới!'}
                  </p>
                  <button
                    onClick={handleOpenAddTask}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Tạo việc mới ngay
                  </button>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const category = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
                  const CategoryIcon = category.icon;
                  const assigneeMember = members.find(m => m.id === task.assigneeId);
                  const priority = PRIORITIES[task.priority || 'medium'];

                  // Calculate subtasks completion
                  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
                  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 shadow-sm hover:shadow-md ${
                        task.completed
                          ? 'border-emerald-200/80 bg-emerald-50/20'
                          : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(task)}
                          className="mt-1 shrink-0 transition-transform active:scale-90"
                          title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle className="w-7 h-7 text-slate-300 hover:text-emerald-500 transition-colors" />
                          )}
                        </button>

                        {/* Task Body */}
                        <div className="flex-1 min-w-0">
                          {/* Title & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-bold text-base leading-snug break-words ${
                              task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}>
                              {task.title}
                            </h4>

                            {/* Card Edit & Delete Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Meta Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Category Badge */}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${category.bg} ${category.color}`}>
                              <CategoryIcon className="w-3 h-3" />
                              {category.name}
                            </span>

                            {/* Priority Badge */}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                              {priority.label}
                            </span>

                            {/* Reward Points Badge */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              +{task.points || 10}đ
                            </span>

                            {/* Assignee Badge */}
                            {assigneeMember ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                                <span className={`w-2 h-2 rounded-full ${assigneeMember.presence === 'home' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {assigneeMember.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-dashed border-slate-300">
                                Chưa phân công
                              </span>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Hạn: {task.dueDate}
                              </span>
                            )}
                          </div>

                          {/* Note text if any */}
                          {task.note && (
                            <p className="text-xs text-slate-600 mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <strong className="font-semibold text-slate-700">Ghi chú:</strong> {task.note}
                            </p>
                          )}

                          {/* Subtasks / Checklist Items */}
                          {totalSubtasks > 0 && (
                            <div className="mt-3 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Danh sách mục con ({completedSubtasks}/{totalSubtasks})</span>
                                <span className="text-emerald-600">
                                  {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {task.subtasks.map(st => (
                                  <label
                                    key={st.id}
                                    onClick={() => toggleSubtask(task.id, st.id)}
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900 group"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => {}} // handled by click
                                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                      {st.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Photo Proof Section */}
                          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            {task.imageProof ? (
                              <div className="flex items-center gap-2">
                                <div
                                  onClick={() => setPreviewImage(task.imageProof)}
                                  className="relative group cursor-pointer"
                                >
                                  <img
                                    src={task.imageProof}
                                    alt="Ảnh minh chứng"
                                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-2xl border-2 border-emerald-400/80 shadow-sm transition group-hover:opacity-90"
                                  />
                                  <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                    <Eye className="w-5 h-5" />
                                  </div>
                                </div>
                                <div className="text-xs">
                                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Có ảnh minh chứng
                                  </div>
                                  <button
                                    onClick={() => removeImageProof(task.id)}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] underline mt-0.5"
                                  >
                                    Xóa ảnh
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-200">
                                <Camera className="w-3.5 h-3.5 text-slate-500" />
                                <span>Chụp / Thêm ảnh minh chứng</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleUploadProof(task.id, e)}
                                />
                              </label>
                            )}

                            {/* Completed status indicator */}
                            {task.completed && (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5" /> Đã hoàn tất
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ĐIỂM DANH & LỊCH TRÌNH (PRESENCE & SCHEDULE) */}
        {/* ========================================================= */}
        {activeTab === 'presence' && (
          <div className="space-y-5">
            {/* My Presence Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Trạng thái điểm danh của bạn</h3>
                  <p className="text-xs text-slate-500">Giúp cả nhà biết bạn đang ở nhà hay đang bận ra ngoài</p>
                </div>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 w-fit">
                  {activeMembersCount}/{members.length} người đang ở nhà
                </div>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => handleUpdatePresence('home')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    currentUser.presence === 'home' && !isReportingSchedule
                      ? 'bg-white shadow-md text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <House className="w-4 h-4 text-emerald-500" />
                  <span>Đang ở nhà</span>
                </button>

                <button
                  onClick={() => handleUpdatePresence('work')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isReportingSchedule || currentUser.presence === 'work'
                      ? 'bg-white shadow-md text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span>Báo lịch đi học / làm</span>
                </button>

                <button
                  onClick={() => handleUpdatePresence('away')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    currentUser.presence === 'away' && !isReportingSchedule
                      ? 'bg-white shadow-md text-slate-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserX className="w-4 h-4 text-slate-500" />
                  <span>Vắng mặt</span>
                </button>
              </div>

              {/* Schedule Reporting Form */}
              {isReportingSchedule && (
                <form onSubmit={handleSubmitSchedule} className="bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-200/80 animate-in fade-in slide-in-from-top-2 space-y-3">
                  <div className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-blue-600" /> Báo giờ vắng mặt / Đi học
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-blue-900 mb-1">Đi lúc *</label>
                      <input
                        type="time"
                        required
                        value={scheduleForm.departureTime}
                        onChange={e => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-900 mb-1">Dự kiến về *</label>
                      <input
                        type="time"
                        required
                        value={scheduleForm.returnTime}
                        onChange={e => setScheduleForm({ ...scheduleForm, returnTime: e.target.value })}
                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1">Lý do / Môn học</label>
                    <input
                      type="text"
                      placeholder="VD: Đi học thêm Toán, Tăng ca ở công ty, Đi cà phê với bạn..."
                      value={scheduleForm.note}
                      onChange={e => setScheduleForm({ ...scheduleForm, note: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-sm"
                    >
                      Lưu lịch trình
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReportingSchedule(false)}
                      className="px-4 bg-white text-blue-700 font-bold py-2.5 rounded-xl text-sm transition border border-blue-200"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Members Presence Roster */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Danh sách thành viên & Lịch trình</h3>
              
              <div className="space-y-2.5">
                {members.map(member => {
                  const isHome = member.presence === 'home';
                  const isWork = member.presence === 'work';
                  const isAway = member.presence === 'away';

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                          isHome ? 'bg-emerald-100 text-emerald-700' : isWork ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            {member.name}
                            {member.id === currentUser.id && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">Bạn</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {isHome && <span className="text-emerald-600 font-semibold flex items-center gap-1">● Đang ở nhà</span>}
                            {isWork && (
                              <span className="text-blue-600 font-semibold flex items-center gap-1">
                                ● Vắng ({member.departureTime || '?'} - {member.returnTime || '?'})
                              </span>
                            )}
                            {isAway && <span className="text-slate-400 font-semibold flex items-center gap-1">● Đang vắng mặt</span>}
                          </div>
                        </div>
                      </div>

                      {/* Schedule info or actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {member.note && (
                          <span className="text-xs bg-white text-slate-600 px-3 py-1 rounded-xl border border-slate-200">
                            {member.note}
                          </span>
                        )}
                        {(member.departureTime || member.presence !== 'home') && (
                          <button
                            onClick={() => handleClearSchedule(member.id)}
                            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1 rounded-xl border border-slate-200 transition"
                          >
                            Báo đã về nhà
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BẢNG VÀNG & QUÀ THƯỞNG (REWARDS & LEADERBOARD) */}
        {/* ========================================================= */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            
            {/* Leaderboard Podium */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-amber-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300" /> Bảng vàng chăm chỉ
                  </h3>
                  <p className="text-xs text-amber-100 font-medium">Bảng xếp hạng điểm tích lũy từ việc nhà</p>
                </div>
                <div className="text-xs font-extrabold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                  Cập nhật liên tục
                </div>
              </div>

              {/* Podium Ranking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rankedMembers.map((member, index) => {
                  const medals = ['🥇 Hạng 1', '🥈 Hạng 2', '🥉 Hạng 3'];
                  const medalBg = ['bg-yellow-400 text-amber-950', 'bg-slate-200 text-slate-800', 'bg-amber-200 text-amber-900'];

                  return (
                    <div
                      key={member.id}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${medalBg[index] || 'bg-white/20 text-white'}`}>
                          {medals[index] || `Hạng ${index + 1}`}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-200">
                          <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> {member.streak || 1} ngày
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="font-extrabold text-base truncate">{member.name}</div>
                        <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
                          {member.points || 0} <span className="text-xs font-semibold text-amber-200">điểm</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards Shop */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-emerald-600" /> Tiệm quà thưởng gia đình
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bạn hiện có <strong className="text-amber-600 font-bold">{currentUser.points || 0} điểm</strong> để đổi quà
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingReward(prev => !prev)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition border border-emerald-200/70 w-fit"
                >
                  + Thêm phần thưởng mới
                </button>
              </div>

              {/* Add Reward Form */}
              {isAddingReward && (
                <form onSubmit={handleAddReward} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-700">Tạo phần thưởng mới</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tên phần thưởng (VD: Đi ăn pizza...)"
                      value={rewardForm.title}
                      onChange={e => setRewardForm({ ...rewardForm, title: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Số điểm cần (VD: 30)"
                      value={rewardForm.points}
                      onChange={e => setRewardForm({ ...rewardForm, points: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Lưu quà</button>
                    <button type="button" onClick={() => setIsAddingReward(false)} className="px-3 py-2 bg-white text-slate-600 rounded-xl text-xs">Hủy</button>
                  </div>
                </form>
              )}

              {/* Rewards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rewards.map(reward => {
                  const canAfford = (currentUser.points || 0) >= reward.points;

                  return (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-xs">
                          {reward.icon || '🎁'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{reward.title}</div>
                          <div className="text-xs text-amber-600 font-bold mt-0.5">
                            {reward.points} điểm
                            {reward.redeemedCount > 0 && (
                              <span className="text-slate-400 font-normal ml-2">Đã đổi {reward.redeemedCount} lần</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(reward)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Đổi ngay' : 'Chưa đủ điểm'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BẢNG TIN DÁN TỦ LẠNH (STICKY FRIDGE NOTES) */}
        {/* ========================================================= */}
        {activeTab === 'fridge' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-amber-500" /> Bảng tin dán tủ lạnh gia đình
                </h3>
                <p className="text-xs text-slate-500">Để lại lời nhắn, nhắc nhở hoặc thực đơn hôm nay cho cả nhà</p>
              </div>

              {/* Post Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={`Để lại lời nhắn từ ${currentUser.name}...`}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Dán tin
                </button>
              </form>
            </div>

            {/* Sticky Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className={`rounded-3xl p-5 border shadow-sm relative group transition hover:rotate-1 ${note.color}`}
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/10">
                    <span className="font-bold text-xs uppercase tracking-wider">{note.authorName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] opacity-75">{note.time}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 transition"
                        title="Gỡ tin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: THỐNG KÊ & SAO LƯU (STATS & BACKUP) */}
        {/* ========================================================= */}
        {activeTab === 'stats' && (
          <div className="space-y-5">
            {/* Overall Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Tổng việc</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{totalTasks}</div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase">Đã hoàn thành</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasksCount}</div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm text-center">
                <div className="text-xs font-bold text-amber-600 uppercase">Tỉ lệ đạt</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{completionPercentage}%</div>
              </div>
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm text-center">
                <div className="text-xs font-bold text-blue-600 uppercase">Thành viên</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{members.length}</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Phân bố công việc theo danh mục</h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat.id);
                  const catCompleted = catTasks.filter(t => t.completed).length;
                  const pct = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;
                  const Icon = cat.icon;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                          {cat.name}
                        </span>
                        <span>{catCompleted}/{catTasks.length} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Management Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Sao lưu & Khôi phục dữ liệu</h3>
                <p className="text-xs text-slate-500">Lưu lại toàn bộ dữ liệu hoặc chuyển sang thiết bị/trình duyệt khác</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Xuất dữ liệu (JSON)</span>
                </button>

                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Nhập dữ liệu (JSON)</span>
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                <button
                  onClick={handleResetSampleData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Khôi phục dữ liệu mẫu</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FLOATING ACTION BUTTON (Add Task) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenAddTask}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-3xl shadow-xl shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95"
          title="Tạo việc mới"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* LIGHTBOX MODAL FOR IMAGE PROOF */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2 transition shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Ảnh phóng to"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
