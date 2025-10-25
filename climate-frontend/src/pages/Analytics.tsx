import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  TrendingUp, 
  MapPin,
  Download,
  RefreshCw,
  AlertTriangle,
  Shield,
  Wheat,
  Activity,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  disasters: {
    total: number;
    active: number;
    resolved: number;
    byMonth: { month: string; count: number; }[];
    bySeverity: { severity: string; count: number; }[];
    byLocation: { location: string; count: number; }[];
    trends: { metric: string; value: number; change: number; }[];
  };
  foodSecurity: {
    totalItems: number;
    lowStock: number;
    expired: number;
    totalValue: number;
    byCategory: { category: string; count: number; value: number; }[];
    expiryTrends: { month: string; expired: number; }[];
    costAnalysis: { month: string; cost: number; savings: number; }[];
  };
  vulnerability: {
    totalAssessments: number;
    highRisk: number;
    populationCovered: number;
    averageRiskScore: number;
    byRiskLevel: { level: string; count: number; }[];
    riskFactors: { factor: string; frequency: number; }[];
  };
  predictions: {
    nextMonthDisasters: number;
    foodShortageRisk: string;
    mostVulnerableCommunities: string[];
    recommendedActions: string[];
  };
}

const Analytics: React.FC = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState('6months');

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive analytics data
      const mockData: AnalyticsData = {
        disasters: {
          total: 47,
          active: 8,
          resolved: 39,
          byMonth: [
            { month: 'Jan', count: 6 },
            { month: 'Feb', count: 4 },
            { month: 'Mar', count: 8 },
            { month: 'Apr', count: 12 },
            { month: 'May', count: 9 },
            { month: 'Jun', count: 8 }
          ],
          bySeverity: [
            { severity: 'Critical', count: 5 },
            { severity: 'High', count: 12 },
            { severity: 'Medium', count: 18 },
            { severity: 'Low', count: 12 }
          ],
          byLocation: [
            { location: 'Western Cape', count: 15 },
            { location: 'Gauteng', count: 12 },
            { location: 'Limpopo', count: 8 },
            { location: 'Eastern Cape', count: 7 },
            { location: 'Other', count: 5 }
          ],
          trends: [
            { metric: 'Response Time', value: 2.4, change: -18 },
            { metric: 'Resolution Rate', value: 87, change: 12 },
            { metric: 'Affected Population', value: 15420, change: -8 }
          ]
        },
        foodSecurity: {
          totalItems: 1847,
          lowStock: 23,
          expired: 8,
          totalValue: 485000,
          byCategory: [
            { category: 'Grains & Rice', count: 450, value: 125000 },
            { category: 'Canned Goods', count: 380, value: 95000 },
            { category: 'Protein Sources', count: 290, value: 145000 },
            { category: 'Vegetables', count: 320, value: 78000 },
            { category: 'Emergency Supplies', count: 407, value: 42000 }
          ],
          expiryTrends: [
            { month: 'Jan', expired: 5 },
            { month: 'Feb', expired: 3 },
            { month: 'Mar', expired: 7 },
            { month: 'Apr', expired: 12 },
            { month: 'May', expired: 6 },
            { month: 'Jun', expired: 8 }
          ],
          costAnalysis: [
            { month: 'Jan', cost: 45000, savings: 8000 },
            { month: 'Feb', cost: 52000, savings: 6500 },
            { month: 'Mar', cost: 48000, savings: 9200 },
            { month: 'Apr', cost: 61000, savings: 7800 },
            { month: 'May', cost: 55000, savings: 11000 },
            { month: 'Jun', cost: 49000, savings: 9500 }
          ]
        },
        vulnerability: {
          totalAssessments: 28,
          highRisk: 12,
          populationCovered: 245800,
          averageRiskScore: 68,
          byRiskLevel: [
            { level: 'Very High', count: 6 },
            { level: 'High', count: 6 },
            { level: 'Medium', count: 10 },
            { level: 'Low', count: 6 }
          ],
          riskFactors: [
            { factor: 'Flooding', frequency: 18 },
            { factor: 'Food Insecurity', frequency: 15 },
            { factor: 'Drought', frequency: 12 },
            { factor: 'Poor Infrastructure', frequency: 10 },
            { factor: 'Unemployment', frequency: 8 }
          ]
        },
        predictions: {
          nextMonthDisasters: 9,
          foodShortageRisk: 'Medium',
          mostVulnerableCommunities: ['Khayelitsha Township', 'Rural Limpopo Village', 'Port Elizabeth Coastal'],
          recommendedActions: [
            'Increase food reserves in Limpopo region',
            'Strengthen flood defenses in Western Cape',
            'Deploy mobile health units to remote areas',
            'Enhance early warning systems'
          ]
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Mock report download
    console.log('Downloading analytics report...');
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="mt-2 text-gray-600">Comprehensive data analysis and predictive insights</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Disasters</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{data.disasters.active}</p>
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {data.disasters.trends[2].change}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wheat className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Food Items</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{data.foodSecurity.totalItems}</p>
                  <div className="ml-2 flex items-center text-xs text-red-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {data.foodSecurity.lowStock} low
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Population Covered</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(data.vulnerability.populationCovered / 1000)}K
                  </p>
                  <div className="ml-2 flex items-center text-xs text-orange-600">
                    <Target className="h-3 w-3 mr-1" />
                    {data.vulnerability.highRisk} high risk
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Health</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                  <div className="ml-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.disasters.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{trend.metric}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">
                      {trend.metric === 'Affected Population' 
                        ? (trend.value || 0).toLocaleString()
                        : trend.metric === 'Response Time'
                        ? `${trend.value || 0}h`
                        : `${trend.value || 0}%`
                      }
                    </span>
                    <div className={`flex items-center text-xs ${
                      trend.change > 0 
                        ? trend.metric === 'Affected Population' ? 'text-red-600' : 'text-green-600'
                        : trend.metric === 'Affected Population' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {((trend.change > 0 && trend.metric !== 'Affected Population') || 
                        (trend.change < 0 && trend.metric === 'Affected Population')) ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(trend.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disaster Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.disasters.bySeverity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.severity === 'Critical' ? 'bg-red-500' :
                      item.severity === 'High' ? 'bg-orange-500' :
                      item.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">{item.severity}</span>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.disasters.byLocation.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{location.location}</span>
                  </div>
                  <span className="text-sm font-medium">{location.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food Security Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Food Security Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-green-700">
                    R{(data.foodSecurity.totalValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-700">{data.foodSecurity.lowStock}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Inventory by Category</p>
                <div className="space-y-2">
                  {data.foodSecurity.byCategory.map((category, index) => {
                    const percentage = (category.count / data.foodSecurity.totalItems) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-8">{category.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{data.vulnerability.averageRiskScore}</div>
                <p className="text-sm text-gray-600">Average Risk Score</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Risk Level Distribution</p>
                <div className="space-y-2">
                  {data.vulnerability.byRiskLevel.map((level, index) => {
                    const percentage = (level.count / data.vulnerability.totalAssessments) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{level.level}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                level.level === 'Very High' ? 'bg-red-500' :
                                level.level === 'High' ? 'bg-orange-500' :
                                level.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium w-6">{level.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Top Risk Factors</p>
                <div className="space-y-1">
                  {data.vulnerability.riskFactors.slice(0, 5).map((factor, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600">{factor.factor}</span>
                      <span className="font-medium">{factor.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Predictive Analytics & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Predicted Trends</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-orange-700">Next Month Disasters</span>
                  <Badge variant="warning">{data.predictions.nextMonthDisasters}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-700">Food Shortage Risk</span>
                  <Badge variant="outline">{data.predictions.foodShortageRisk}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">High Priority Communities</h4>
              <div className="space-y-2">
                {data.predictions.mostVulnerableCommunities.map((community, index) => (
                  <div key={index} className="flex items-center p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">{community}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {data.predictions.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                    <Target className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Disasters</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Food Expiry</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-center space-x-4 pt-4">
              {data.disasters.byMonth.map((month, index) => {
                const disasterHeight = (month.count / 12) * 100;
                const expiryHeight = (data.foodSecurity.expiryTrends[index]?.expired / 12) * 100;
                
                return (
                  <div key={month.month} className="flex flex-col items-center space-y-2">
                    <div className="flex items-end space-x-1 h-40">
                      <div 
                        className="w-6 bg-red-500 rounded-t"
                        style={{ height: `${disasterHeight}%` }}
                        title={`${month.count} disasters`}
                      ></div>
                      <div 
                        className="w-6 bg-yellow-500 rounded-t"
                        style={{ height: `${expiryHeight}%` }}
                        title={`${data.foodSecurity.expiryTrends[index]?.expired || 0} expired items`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;