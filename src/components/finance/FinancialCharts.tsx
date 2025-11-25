import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  budget_category_id?: string;
  budget_categories?: {
    name: string;
    icon?: string;
  };
}

interface BudgetCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface FinancialChartsProps {
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export const FinancialCharts = ({ transactions, budgetCategories }: FinancialChartsProps) => {
  // Income vs Expense trend (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthTransactions = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
    );
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    monthlyData.push({
      month: format(monthDate, 'MMM yyyy'),
      income: Math.round(income),
      expense: Math.round(expense),
      net: Math.round(income - expense),
    });
  }

  // Expense by category (current month)
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  
  const categoryExpenses = budgetCategories.map(category => {
    const total = transactions
      .filter(t => 
        t.type === 'expense' &&
        t.budget_category_id === category.id &&
        isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: category.name,
      value: Math.round(total),
      icon: category.icon,
    };
  }).filter(cat => cat.value > 0);

  // Add uncategorized expenses
  const uncategorizedExpense = transactions
    .filter(t => 
      t.type === 'expense' &&
      !t.budget_category_id &&
      isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  if (uncategorizedExpense > 0) {
    categoryExpenses.push({
      name: 'Tanpa Kategori',
      value: Math.round(uncategorizedExpense),
      icon: '📦',
    });
  }

  // Weekly expense trend (last 4 weeks)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = subMonths(new Date(), 0);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    
    const weekExpense = transactions
      .filter(t => 
        t.type === 'expense' &&
        isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd })
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    weeklyData.push({
      week: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM')}`,
      expense: Math.round(weekExpense),
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{payload[0].payload.month || payload[0].payload.week}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: Rp {entry.value.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">
            {payload[0].payload.icon} {payload[0].name}
          </p>
          <p className="text-primary">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6">
      {/* Income vs Expense Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
          <CardDescription>6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" name="Pemasukan" fill="hsl(var(--primary))" />
              <Bar dataKey="expense" name="Pengeluaran" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada pengeluaran bulan ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pengeluaran Mingguan</CardTitle>
            <CardDescription>4 minggu terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" angle={-15} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  name="Pengeluaran"
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Net Income Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Aliran Kas (Net Income)</CardTitle>
          <CardDescription>Selisih pemasukan dan pengeluaran</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="net" 
                name="Net Income" 
                fill="hsl(var(--primary))"
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
