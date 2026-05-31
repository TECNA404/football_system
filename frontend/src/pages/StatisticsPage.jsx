import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Activity, Target, Shield, Download, PieChart, BarChart } from "lucide-react";
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useTranslation } from "react-i18next";
import { getPersonalStats } from "../api/tournamentsApi";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatMonth = (isoString, i18n) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const options = { month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  } catch (e) {
    return isoString;
  }
};

function Counter({ end, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
}

const StatisticsPage = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPersonalStats();
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('navbar.tournaments'),
      value: stats?.tournaments_count || 0,
      icon: <Trophy className="text-primary" size={32} />,
      color: "bg-primary-light",
      desc: t('stats.my_tournaments_desc')
    },
    {
      title: t('navbar.teams'),
      value: stats?.teams_count || 0,
      icon: <Users className="text-info" size={32} />,
      color: "bg-info-light",
      desc: t('stats.my_teams_desc')
    },
    {
      title: t('navbar.matches'),
      value: stats?.matches_count || 0,
      icon: <Activity className="text-success" size={32} />,
      color: "bg-success-light",
      desc: t('stats.my_matches_desc')
    },
    {
      title: t('home.total_goals'),
      value: stats?.total_goals || 0,
      icon: <Target className="text-danger" size={32} />,
      color: "bg-danger-light",
      desc: t('stats.my_goals_desc')
    }
  ];

  return (
    <div className="container py-5">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center"
      >
        <h1 className="display-4 fw-bold">{t('stats.title')}</h1>
        <p className="lead text-muted">{t('stats.subtitle')}</p>
      </motion.div>

      <div className="row g-4 mb-5">
        {statCards.map((card, idx) => (
          <motion.div 
            key={idx}
            className="col-md-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="card border-0 shadow-sm h-100 p-4 hover-up text-center">
              <div className={`mb-3 p-3 rounded-circle d-inline-block mx-auto ${card.color}`}>
                {card.icon}
              </div>
              <h5 className="text-muted mb-1">{card.title}</h5>
              <div className="display-5 fw-bold mb-2">
                <Counter end={card.value} />
              </div>
              <p className="small text-muted mb-0">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <motion.div 
            className="card border-0 shadow-sm p-4 h-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <BarChart className="text-primary" /> {t('stats.goals_by_tournament') || "Goals by Tournament"}
            </h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ReBarChart data={stats?.charts?.goals_by_tournament || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [value, t('home.total_goals')]}
                  />
                  <Bar dataKey="goals" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="col-lg-6">
          <motion.div 
            className="card border-0 shadow-sm p-4 h-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Activity className="text-success" /> {t('stats.match_activity') || "Match Activity"}
            </h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={stats?.charts?.activity_over_time || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(val) => formatMonth(val, i18n)}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelFormatter={(val) => formatMonth(val, i18n)}
                    formatter={(value) => [value, t('navbar.matches')]}
                  />
                  <Line type="monotone" dataKey="matches" stroke="#00C49F" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <motion.div 
            className="card border-0 shadow-sm p-4 h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="row align-items-center">
              <div className="col-md-6">
                <h4 className="fw-bold mb-4">{t('stats.results_distribution') || "Results Distribution"}</h4>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <RePieChart>
                      <Pie
                        data={stats?.charts?.results_distribution || []}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.charts?.results_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, t(`stats.${name}`)]} />
                      <Legend formatter={(value) => t(`stats.${value}`)} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-6">
                <h5 className="fw-bold mb-3">{t('stats.summary')}</h5>
                <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                        <span>{t('stats.avg_goals_per_match')}</span>
                        <span className="fw-bold badge bg-primary rounded-pill">
                            {stats?.matches_count > 0 ? (stats.total_goals / stats.matches_count).toFixed(2) : 0}
                        </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                        <span>{t('stats.avg_teams_per_tournament')}</span>
                        <span className="fw-bold badge bg-info rounded-pill">
                            {stats?.tournaments_count > 0 ? (stats.teams_count / stats.tournaments_count).toFixed(1) : 0}
                        </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                        <span>{t('stats.win_rate')}</span>
                        <span className="fw-bold badge bg-success rounded-pill">
                            {stats?.win_rate || 0}%
                        </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                        <span>{t('stats.most_active_tournament')}</span>
                        <span className="fw-bold text-primary small text-end" style={{ maxWidth: '150px' }}>
                            {stats?.most_active_tournament || "N/A"}
                        </span>
                    </div>
                    <div className="list-group-item d-flex flex-column gap-2 pt-3 px-0 bg-transparent border-0">
                        <div className="d-flex justify-content-between small">
                            <span>{t('stats.wins')}</span>
                            <span className="text-success fw-bold">{stats?.wins_count || 0}</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                            <span>{t('stats.draws')}</span>
                            <span className="text-warning fw-bold">{stats?.draws_count || 0}</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                            <span>{t('stats.losses')}</span>
                            <span className="text-danger fw-bold">{stats?.losses_count || 0}</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="col-lg-4">
          <motion.div 
            className="card border-0 shadow-sm p-4 h-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Shield className="text-primary" /> {t('stats.achievements')}
            </h4>
            
            <div className="d-flex flex-column gap-3">
              {[
                { title: t('stats.ach_organizer'), icon: "🏆", condition: (stats?.tournaments_count >= 1) },
                { title: t('stats.ach_club_owner'), icon: "🛡️", condition: (stats?.teams_count >= 1) },
                { title: t('stats.ach_goal_machine'), icon: "🔥", condition: (stats?.total_goals >= 50) },
                { title: t('stats.ach_veteran'), icon: "⭐", condition: (stats?.matches_count >= 10) },
              ].map((ach, i) => (
                <div key={i} className={`d-flex align-items-center gap-3 p-3 rounded-3 ${ach.condition ? 'bg-primary-light border-primary-subtle' : 'bg-light opacity-50'}`} style={{ border: '1px solid transparent' }}>
                  <span className="fs-3">{ach.icon}</span>
                  <div>
                    <h6 className="fw-bold mb-0">{ach.title}</h6>
                    <small className={ach.condition ? "text-primary" : "text-muted"}>
                      {ach.condition ? t('stats.unlocked') : t('stats.locked')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
