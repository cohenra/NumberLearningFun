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
} from "recharts";
import { useLanguage } from "@/lib/i18n/languageContext";

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
        return t('content.hebrewLetters');
      case 'english-letters':
        return t('content.englishLetters');
      case 'numbers':
      default:
        return t('content.numbers');
    }
  };

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
