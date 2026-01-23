
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, AlertTriangle, Sparkles, FileText, CalendarIcon, Trash2 } from "lucide-react";
import { analyzeUploadedReport, AnalyzeUploadedReportOutput, AnalyzeUploadedReportInput } from "@/ai/flows/analyze-uploaded-report";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useReports } from "@/context/report-context";
import { Report } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNotifications } from "@/context/notification-context";

type Status = "idle" | "uploading" | "analyzing" | "success" | "error";

const statusInfo = {
  idle: { text: "Fill the form and upload your lab report to begin.", icon: Upload },
  uploading: { text: "Uploading file...", icon: Loader2 },
  analyzing: { text: "AI is analyzing your report...", icon: Sparkles },
  success: { text: "Analysis complete.", icon: FileText },
  error: { text: "An error occurred.", icon: AlertTriangle },
};

const reportTypes = [
    { value: "blood_test", label: "Blood Test" },
    { value: "mri_scan", label: "MRI Scan" },
    { value: "xray", label: "X-Ray" },
    { value: "urinalysis", label: "Urinalysis" },
    { value: "other", label: "Other" },
];

export default function ReportAnalysisPage() {
  const { reports, addReport, removeReport } = useReports();
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportDate, setReportDate] = useState<Date | undefined>();
  const [clinicName, setClinicName] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeUploadedReportOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!file || !reportTitle || !reportType || !reportDate) {
        setError("Please fill in all required fields: Title, Type, Date, and select a file.");
        setStatus("error");
        return;
    }

    setStatus("uploading");
    setError(null);
    setAnalysisResult(null);
    setSelectedReport(null);

    try {
      const reportDataUri = await fileToDataUri(file);
      const pastReports = reports.filter(r => r.type === reportType);
      
      setStatus("analyzing");
      
      const input: AnalyzeUploadedReportInput = { 
          reportDataUri, 
          pastReports: await Promise.all(pastReports.map(async r => ({...r, date: format(r.date, 'yyyy-MM-dd'), fileDataUri: await fileToDataUri(r.file)}))),
      };

      const result = await analyzeUploadedReport(input);

      // Add mock trendGraph data if not present, as AI can't generate images yet.
      const resultWithMocks = {
          ...result,
          healthParameters: result.healthParameters.map(p => ({...p, trendGraph: 'mock'}))
      }

      const newReport: Report = {
        id: `report-${Date.now()}`,
        title: reportTitle,
        type: reportType,
        date: reportDate,
        clinic: clinicName,
        file: file,
        analysis: resultWithMocks
      };
      addReport(newReport);
      setAnalysisResult(resultWithMocks);
      setSelectedReport(newReport);
      addNotification({
          title: 'Report Analyzed',
          description: `Your report "${newReport.title}" has been successfully analyzed.`,
          action: <Button variant="link" size="sm" onClick={() => handleViewReport(newReport)}>View</Button>
      })

      setStatus("success");
      
      // Reset form
      setFile(null);
      setReportTitle("");
      setReportType("");
      setReportDate(undefined);
      setClinicName("");
      const fileInput = document.getElementById('report-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (e) {
      console.error(e);
      setError("Failed to analyze the report. Please try again.");
      setStatus("error");
    }
  };

  const handleViewReport = (report: Report) => {
      setAnalysisResult(report.analysis || null);
      setSelectedReport(report);
      setStatus(report.analysis ? 'success' : 'idle');
      setError(null);
  }

  const handleCreateNew = () => {
      setSelectedReport(null);
      setAnalysisResult(null);
      setStatus('idle');
  }

  const StatusIndicator = statusInfo[status].icon;

  const getBadgeVariant = (change: string) => {
      if (change.includes('🟢')) return 'secondary';
      if (change.includes('🟡')) return 'outline';
      if (change.includes('🔴')) return 'destructive';
      return 'default';
  }
  
  const trendData = {
    Cholesterol: [{date: 'Jan', value: 200}, {date: 'Apr', value: 210}, {date: 'Jul', value: 220}],
    'Blood Sugar': [{date: 'Jan', value: 92}, {date: 'Apr', value: 96}, {date: 'Jul', value: 95}],
    'HDL': [{date: 'Jan', value: 48}, {date: 'Apr', value: 46}, {date: 'Jul', value: 45}],
    'LDL': [{date: 'Jan', value: 120}, {date: 'Apr', value: 135}, {date: 'Jul', value: 140}],
    'Triglycerides': [{date: 'Jan', value: 150}, {date: 'Apr', value: 160}, {date: 'Jul', value: 155}],
  }

  const getTrendDataForParam = (paramName: string) => {
    return trendData[paramName as keyof typeof trendData] || [{date: 'N/A', value: 0}];
  }

  const groupedReports = reports.reduce((acc, report) => {
    (acc[report.type] = acc[report.type] || []).push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">AI-Powered Report Analysis</h1>
            <p className="text-muted-foreground">Upload a lab report to extract key parameters and track changes over time.</p>
        </div>
      </div>

      {!selectedReport && (
        <Card>
            <CardHeader>
            <CardTitle>Upload Health Report</CardTitle>
            <CardDescription>Fill out the details below to get an AI-powered analysis of your report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="report-title">Report Title</Label>
                        <Input id="report-title" placeholder="e.g., Blood Test Results" value={reportTitle} onChange={e => setReportTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select onValueChange={setReportType} value={reportType}>
                            <SelectTrigger id="report-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportTypes.map(rt => <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-date">Report Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !reportDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={reportDate}
                                onSelect={setReportDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clinic-name">Clinic Name (Optional)</Label>
                        <Input id="clinic-name" placeholder="City Hospital" value={clinicName} onChange={e => setClinicName(e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="report-file">Select File</Label>
                        <Input id="report-file" type="file" onChange={handleFileChange} accept="image/*,application/pdf"/>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={handleAnalyze} disabled={!file || status === 'analyzing' || status === 'uploading'}>
                    { (status === 'analyzing' || status === 'uploading') ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4"/>
                    )}
                    Analyze
                    </Button>
                </div>
                
                {(status !== 'idle' && status !== 'success' && status !== 'error') && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-md bg-muted/50 text-muted-foreground text-sm">
                        <StatusIndicator className={`h-4 w-4 ${status === 'analyzing' || status === 'uploading' ? 'animate-spin' : ''}`} />
                        <span>{statusInfo[status].text}</span>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      {error && status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedReport && status === 'success' && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{selectedReport.title}</CardTitle>
             <CardDescription>
                {format(selectedReport.date, 'PPP')}
                {selectedReport.clinic && ` - ${selectedReport.clinic}`}
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold mb-2">AI Summary</h3>
                <p className="text-sm bg-primary/5 p-4 rounded-md border border-primary/10">{analysisResult.reportSummary}</p>
            </div>
            
            {analysisResult.healthParameters.length > 0 && (
                <>
                    <div>
                        <h3 className="font-semibold mb-2">Key Health Parameters</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analysisResult.healthParameters.map(p => (
                                    <TableRow key={p.name}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.value} {p.unit}</TableCell>
                                        <TableCell>
                                            <Badge variant={getBadgeVariant(p.change)}>{p.change}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-4">Parameter Trends</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            {analysisResult.healthParameters.filter(p => p.trendGraph === 'mock').map(p => (
                                <div key={p.name}>
                                    <h4 className="font-medium text-sm mb-2">{p.name}</h4>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer>
                                            <RechartsBarChart data={getTrendDataForParam(p.name)}>
                                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Report History</CardTitle>
            <CardDescription>View your previously uploaded reports and their analyses.</CardDescription>
        </CardHeader>
        <CardContent>
            {reports.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                    {reportTypes.map(rt => {
                        const reportsForType = groupedReports[rt.value] || [];
                        if (reportsForType.length === 0) return null;
                        return (
                            <AccordionItem value={rt.value} key={rt.value}>
                                <AccordionTrigger>{rt.label} ({reportsForType.length})</AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportsForType.map(report => (
                                                <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewReport(report)}>
                                                    <TableCell className="font-medium">{report.title}</TableCell>
                                                    <TableCell>{format(report.date, 'PPP')}</TableCell>
                                                    <TableCell className="text-right">
                                                         <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeReport(report.id); if(selectedReport?.id === report.id) handleCreateNew(); }}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                        <Button variant="link" size="sm">View</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Reports Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Upload your first report to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );

    

    

    

    
