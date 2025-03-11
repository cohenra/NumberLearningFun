import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

export default function ParentDashboard() {
  const { data: progress } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress"],
  });

  const calculateAverageScore = () => {
    if (!progress || progress.length === 0) return 0;
    const totalScore = progress.reduce((acc, curr) => 
      acc + (curr.correctAnswers / curr.totalQuestions) * 100, 0
    );
    return Math.round(totalScore / progress.length);
  };

  const averageScore = calculateAverageScore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">לוח בקרה להורים</h1>
          <Link href="/">
            <Button variant="outline">חזרה</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>ציון ממוצע</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{averageScore}%</div>
              <Progress value={averageScore} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>סך השאלות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {progress?.reduce((acc, curr) => acc + curr.totalQuestions, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>זמן למידה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {Math.round((progress?.reduce((acc, curr) => acc + curr.timeTaken, 0) || 0) / 60)} דקות
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>התקדמות לאורך זמן</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('he-IL')}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="correctAnswers" 
                    stroke="#8884d8" 
                    name="תשובות נכונות"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
