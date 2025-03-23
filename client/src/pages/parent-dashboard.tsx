import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Progress } from "@/components/ui/progress";
import type { Progress as ProgressType } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLanguage } from "@/lib/i18n/languageContext";
import { useMemo } from "react";

export default function ParentDashboard() {
  const { t, locale, dir } = useLanguage();
  const { data: progressData } = useQuery<ProgressType[]>({ 
    queryKey: ["/api/progress"]
  });

  // Calculate average score
  const averageScore = progressData?.length 
    ? Math.round(progressData.reduce((sum, item) => {
        return sum + (item.correctAnswers / item.totalQuestions * 100);
      }, 0) / progressData.length)
    : 0;

  // Format content type for display
  const formatContentType = (contentType: string = 'numbers') => {
    switch(contentType) {
      case 'hebrew-letters':
      case 'hebrew_letters':
        return t('content.hebrewLetters');
      case 'english-letters':
      case 'english_letters':
        return t('content.englishLetters');
      case 'quick-math':
        return t('quickMath.title');
      case 'numbers':
      default:
        return t('content.numbers');
    }
  };

  // 1. Analyze strengths and weaknesses
  const { strengths, weaknesses } = useMemo(() => {
    if (!progressData || progressData.length === 0) {
      return { strengths: [], weaknesses: [] };
    }

    // Group by content type and numberRange to identify performance
    const performanceByContent: Record<string, { correct: number, total: number, score: number }> = {};
    
    progressData.forEach(item => {
      const key = `${item.contentType}-${item.numberRange}`;
      if (!performanceByContent[key]) {
        performanceByContent[key] = { correct: 0, total: 0, score: 0 };
      }
      performanceByContent[key].correct += item.correctAnswers;
      performanceByContent[key].total += item.totalQuestions;
    });
    
    // Calculate scores and sort
    Object.keys(performanceByContent).forEach(key => {
      const item = performanceByContent[key];
      item.score = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });
    
    const sortedItems = Object.entries(performanceByContent)
      .map(([key, data]) => ({ 
        id: key, 
        contentType: key.split('-')[0], 
        range: parseInt(key.split('-')[1]) || 10,
        score: data.score 
      }))
      .sort((a, b) => b.score - a.score);
    
    return {
      strengths: sortedItems.slice(0, 3),
      weaknesses: [...sortedItems].sort((a, b) => a.score - b.score).slice(0, 3)
    };
  }, [progressData]);

  // 2. Generate personalized learning recommendations
  const recommendations = useMemo(() => {
    if (!progressData || progressData.length === 0 || weaknesses.length === 0) {
      return [];
    }

    return weaknesses.map(item => ({
      id: item.id,
      contentType: item.contentType,
      range: item.range,
      message: `${t('dashboard.tryPracticing')} ${formatContentType(item.contentType)}`
    }));
  }, [weaknesses, progressData, t]);

  // 3. Progress by category
  const categoryProgress = useMemo(() => {
    if (!progressData || progressData.length === 0) {
      return [];
    }

    const categories: Record<string, { correct: number, total: number, score: number }> = {
      numbers: { correct: 0, total: 0, score: 0 },
      hebrew_letters: { correct: 0, total: 0, score: 0 },
      english_letters: { correct: 0, total: 0, score: 0 },
      'quick-math': { correct: 0, total: 0, score: 0 }
    };

    progressData.forEach(item => {
      const category = item.contentType;
      if (categories[category]) {
        categories[category].correct += item.correctAnswers;
        categories[category].total += item.totalQuestions;
      }
    });

    return Object.entries(categories).map(([key, data]) => ({
      name: formatContentType(key),
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      value: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    })).filter(item => item.score > 0);
  }, [progressData]);

  // 4. Learning pattern and frequency
  const learningPattern = useMemo(() => {
    if (!progressData || progressData.length === 0) {
      return { dailyActivity: [], consistencyScore: 0 };
    }

    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Count activities per day
    const dailyCount: Record<string, number> = {};
    last7Days.forEach(day => { dailyCount[day] = 0; });

    progressData.forEach(item => {
      const day = new Date(item.date).toISOString().split('T')[0];
      if (last7Days.includes(day)) {
        dailyCount[day] = (dailyCount[day] || 0) + 1;
      }
    });

    // Calculate consistency score (0-100)
    const daysWithActivity = Object.values(dailyCount).filter(count => count > 0).length;
    const consistencyScore = Math.round((daysWithActivity / 7) * 100);

    // Format for chart
    const dailyActivity = Object.entries(dailyCount).map(([date, count]) => {
      const dayObj = new Date(date);
      const dayName = dayObj.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'short' });
      return {
        day: dayName,
        date: date,
        activities: count
      };
    });

    return { dailyActivity, consistencyScore };
  }, [progressData, locale]);

  // 5. Best performance times
  const performanceTimes = useMemo(() => {
    if (!progressData || progressData.length === 0) {
      return [];
    }

    // Divide day into periods
    const periods: Record<string, { correct: number, total: number, score: number }> = {
      morning: { correct: 0, total: 0, score: 0 },     // 6-12
      afternoon: { correct: 0, total: 0, score: 0 },   // 12-18
      evening: { correct: 0, total: 0, score: 0 }      // 18-24
    };

    progressData.forEach(item => {
      const hour = new Date(item.date).getHours();
      let period = 'evening';
      
      if (hour >= 6 && hour < 12) {
        period = 'morning';
      } else if (hour >= 12 && hour < 18) {
        period = 'afternoon';
      }

      periods[period].correct += item.correctAnswers;
      periods[period].total += item.totalQuestions;
    });

    // Calculate scores
    Object.keys(periods).forEach(key => {
      periods[key].score = periods[key].total > 0 
        ? Math.round((periods[key].correct / periods[key].total) * 100) 
        : 0;
    });

    return Object.entries(periods).map(([key, data]) => ({
      name: t(`dashboard.${key}`),
      score: data.score,
      activities: data.total
    })).filter(item => item.activities > 0);
  }, [progressData, t]);

  // Set colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8 pt-14 md:pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
          <Link href="/">
            <Button variant="outline">{t('nav.home')}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">{t('dashboard.averageScore')}</h3>
                <p className="text-4xl font-bold mt-2">{averageScore}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">{t('dashboard.totalQuestions')}</h3>
                <p className="text-4xl font-bold mt-2">
                  {progressData?.reduce((sum, item) => sum + item.totalQuestions, 0) || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">{t('dashboard.learningTime')}</h3>
                <p className="text-4xl font-bold mt-2">
                  {Math.round((progressData?.reduce((sum, item) => sum + item.timeTaken, 0) || 0) / 60)} {t('dashboard.minutes')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('dashboard.progressOverTime')}</h2>
          </CardHeader>
          <CardContent>
            {progressData && progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={progressData
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(item => ({
                      ...item,
                      date: new Date(item.date),
                      score: Math.round(item.correctAnswers / item.totalQuestions * 100)
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      return new Date(date).toLocaleDateString(
                        locale === 'he' ? 'he-IL' : 'en-US', 
                        { day: '2-digit', month: '2-digit' }
                      );
                    }} 
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'score') return [`${value}%`, t('dashboard.averageScore')];
                      return [value, name];
                    }}
                    labelFormatter={(date) => {
                      return new Date(date).toLocaleDateString(
                        locale === 'he' ? 'he-IL' : 'en-US',
                        { day: '2-digit', month: '2-digit', year: 'numeric' }
                      );
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">{t('dashboard.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 1. Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{t('dashboard.strongItems')}</h2>
            </CardHeader>
            <CardContent>
              {strengths.length > 0 ? (
                <ul className="space-y-3">
                  {strengths.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span>{formatContentType(item.contentType)}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-green-600 ml-2">{item.score}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{t('dashboard.noData')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{t('dashboard.weakItems')}</h2>
            </CardHeader>
            <CardContent>
              {weaknesses.length > 0 ? (
                <ul className="space-y-3">
                  {weaknesses.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span>{formatContentType(item.contentType)}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-orange-600 ml-2">{item.score}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{t('dashboard.noData')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2. Personalized Learning Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('dashboard.recommendations')}</h2>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <ul className="space-y-4">
                {recommendations.map((rec) => (
                  <li key={rec.id} className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <p className="font-medium">{t('dashboard.recommendedPractice')}:</p>
                      <p>{rec.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">{t('dashboard.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Progress by Category */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('dashboard.categoryProgress')}</h2>
          </CardHeader>
          <CardContent>
            {categoryProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryProgress}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value}%`, t('dashboard.averageScore')]} />
                      <Bar dataKey="score" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryProgress}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-500">{t('dashboard.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Learning Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-bold">{t('dashboard.learningPattern')}</h2>
            </CardHeader>
            <CardContent>
              {learningPattern.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={learningPattern.dailyActivity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, t('dashboard.activity')]} />
                    <Bar dataKey="activities" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-gray-500">{t('dashboard.noData')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{t('dashboard.consistencyScore')}</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[200px]">
                <div className="relative h-32 w-32 mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={learningPattern.consistencyScore > 50 ? "#82ca9d" : "#ffc658"}
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 45 * learningPattern.consistencyScore / 100} ${2 * Math.PI * 45 * (1 - learningPattern.consistencyScore / 100)}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{learningPattern.consistencyScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{t('dashboard.lastWeekActivity')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. Best Performance Times */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('dashboard.bestPerformance')}</h2>
          </CardHeader>
          <CardContent>
            {performanceTimes.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={performanceTimes}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="score" name={t('dashboard.averageScore')} fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="activities" name={t('dashboard.activity')} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-500">{t('dashboard.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Activity Table */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">{t('dashboard.learningActivity')}</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-start">{t('dashboard.date')}</th>
                    <th className="py-2 text-start">{t('content.numbers')}</th>
                    <th className="py-2 text-start">{t('dashboard.correctAnswers')}</th>
                    <th className="py-2 text-start">{t('common.time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData && progressData.length > 0 ? (
                    [...progressData]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            {new Date(item.date).toLocaleDateString(
                              locale === 'he' ? 'he-IL' : 'en-US',
                              { day: '2-digit', month: '2-digit', year: 'numeric' }
                            )}
                          </td>
                          <td className="py-3">{formatContentType(item.contentType)}</td>
                          <td className="py-3">
                            {item.correctAnswers}/{item.totalQuestions} ({Math.round(item.correctAnswers / item.totalQuestions * 100)}%)
                          </td>
                          <td className="py-3">
                            {item.timeTaken} {t('common.seconds')}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        {t('dashboard.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
