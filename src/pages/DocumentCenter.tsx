import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import AppNavigation from '@/components/AppNavigation';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Download,
  Upload,
  Filter,
  User,
  Calendar,
  Flag,
  Globe,
  Award,
  Target
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: 'nato' | 'eu' | 'certification' | 'technical' | 'quality';
  status: 'draft' | 'review' | 'approved' | 'expired' | 'overdue';
  progress: number;
  assignedTo: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  version: string;
}

const DocumentCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [documents] = useState<Document[]>([
    {
      id: '1',
      title: 'NATO STANAG 4586 Compliance Report',
      type: 'nato',
      status: 'review',
      progress: 85,
      assignedTo: 'Елена В.',
      deadline: '2024-02-15',
      priority: 'high',
      lastUpdated: '2024-01-12',
      version: 'v2.1'
    },
    {
      id: '2',
      title: 'EU Drone Regulation Certification',
      type: 'eu',
      status: 'approved',
      progress: 100,
      assignedTo: 'Михаил К.',
      deadline: '2024-01-20',
      priority: 'critical',
      lastUpdated: '2024-01-10',
      version: 'v1.0'
    },
    {
      id: '3',
      title: 'Техническая документация Tiger-X Pro',
      type: 'technical',
      status: 'draft',
      progress: 45,
      assignedTo: 'Андрей П.',
      deadline: '2024-02-01',
      priority: 'medium',
      lastUpdated: '2024-01-11',
      version: 'v0.8'
    },
    {
      id: '4',
      title: 'Сертификат качества ISO 9001:2015',
      type: 'quality',
      status: 'overdue',
      progress: 20,
      assignedTo: 'Ольга Т.',
      deadline: '2024-01-10',
      priority: 'critical',
      lastUpdated: '2024-01-05',
      version: 'v0.2'
    }
  ]);

  const documentTypes = [
    { id: 'all', name: 'Все документы', icon: FileText, count: documents.length },
    { id: 'nato', name: 'NATO стандарты', icon: Shield, count: documents.filter(d => d.type === 'nato').length },
    { id: 'eu', name: 'EU регулирование', icon: Globe, count: documents.filter(d => d.type === 'eu').length },
    { id: 'certification', name: 'Сертификация', icon: Award, count: documents.filter(d => d.type === 'certification').length },
    { id: 'technical', name: 'Техническая', icon: Target, count: documents.filter(d => d.type === 'technical').length },
    { id: 'quality', name: 'Качество', icon: CheckCircle, count: documents.filter(d => d.type === 'quality').length }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'ready';
      case 'review': return 'info';
      case 'draft': return 'warning';
      case 'expired': return 'critical';
      case 'overdue': return 'critical';
      default: return 'info';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'ready';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'ЧЕРНОВИК';
      case 'review': return 'НА ПРОВЕРКЕ';
      case 'approved': return 'УТВЕРЖДЕНО';
      case 'expired': return 'ИСТЕКЛО';
      case 'overdue': return 'ПРОСРОЧЕНО';
      default: return status.toUpperCase();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nato': return Shield;
      case 'eu': return Globe;
      case 'certification': return Award;
      case 'technical': return Target;
      case 'quality': return CheckCircle;
      default: return FileText;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const overallProgress = Math.round(
    documents.reduce((acc, doc) => acc + doc.progress, 0) / documents.length
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title="Центр документооборота" subtitle="Управление документацией, сертификацией и соответствием стандартам" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Document Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Всего документов
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{documents.length}</div>
              <p className="text-xs text-muted-foreground">в системе</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Просроченные
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">
                {documents.filter(d => d.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">требуют внимания</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                На проверке
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-warning">
                {documents.filter(d => d.status === 'review').length}
              </div>
              <p className="text-xs text-muted-foreground">ожидают одобрения</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Общий прогресс
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-success">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Filter className="h-5 w-5 text-primary" />
              Фильтры и поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск документов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {documentTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className="flex items-center gap-2"
                  >
                    <type.icon className="h-4 w-4" />
                    {type.name}
                    <Badge variant="secondary" className="text-xs">
                      {type.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-ui">
                <FileText className="h-5 w-5 text-primary" />
                Документы ({filteredDocuments.length})
              </CardTitle>
              <Button variant="mission" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Загрузить документ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <div key={doc.id} className="border border-border rounded-lg p-4 bg-surface-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <TypeIcon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold font-ui text-lg">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">Версия {doc.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip 
                          priority={getPriorityVariant(doc.priority) as any}
                          className="text-xs"
                        >
                          {doc.priority.toUpperCase()}
                        </StatusChip>
                        <StatusChip variant={getStatusVariant(doc.status) as any}>
                          {getStatusText(doc.status)}
                        </StatusChip>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Прогресс:</span>
                        <span className="font-mono font-semibold">{doc.progress}%</span>
                      </div>
                      <Progress value={doc.progress} className="h-2" />
                    </div>

                    {/* Document Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Ответственный:</span>
                        <span className="font-semibold">{doc.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Дедлайн:</span>
                        <span className="font-mono font-semibold">{doc.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Обновлено:</span>
                        <span className="font-mono">{doc.lastUpdated}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Скачать
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Открыть
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Certification Progress */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Award className="h-5 w-5 text-primary" />
              Прогресс сертификации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-success mb-2">87%</div>
                <p className="text-sm text-muted-foreground">NATO совместимость</p>
                <Progress value={87} className="h-2 mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-primary mb-2">92%</div>
                <p className="text-sm text-muted-foreground">EU регулирование</p>
                <Progress value={92} className="h-2 mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-warning mb-2">65%</div>
                <p className="text-sm text-muted-foreground">Техническая документация</p>
                <Progress value={65} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentCenter;