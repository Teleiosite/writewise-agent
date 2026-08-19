import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, FolderPlus, FileText, ArrowRight, Trash2, Calendar, Users, ShieldCheck } from "lucide-react";
import { ProjectCard, type Project } from "./ProjectCard";
import { useNavigate } from "react-router-dom";
import { listDataAnalyses, deleteDataAnalysis } from "@/services/analysisService";
import { DataAnalysis } from "@/types/analysis.types";
import { toast } from "sonner";

interface ProjectsListProps {
  projects: Project[];
  onOpenProject: (projectName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectsList({ projects, onOpenProject, onDeleteProject }: ProjectsListProps) {
  const navigate = useNavigate();
  const [savedAnalyses, setSavedAnalyses] = useState<DataAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);

  useEffect(() => {
    listDataAnalyses().then(list => {
      setSavedAnalyses(list);
      setLoadingAnalyses(false);
    });
  }, []);

  const handleDeleteAnalysis = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this saved analysis?")) {
      await deleteDataAnalysis(id);
      setSavedAnalyses(prev => prev.filter(a => a.id !== id));
      toast.success("Analysis deleted");
    }
  };

  const totalItems = projects.length + savedAnalyses.length;

  return (
    <div className="space-y-6 font-sans">
      <Card className="w-full rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans mb-6">
        <CardHeader className="pb-3 border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base font-bold tracking-tight">
              <FileText className="h-4 w-4" />
              Active Research Workspaces
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
              Manage your statistical analyses, thesis chapters, and bibliography assets
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/data-analysis')}
            className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-3 border border-black dark:border-white"
          >
            <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
            + New Analysis
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {totalItems === 0 && !loadingAnalyses ? (
            <div className="text-center py-12 px-4 border border-dashed border-black dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="w-10 h-10 border border-black dark:border-zinc-700 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center mx-auto mb-3 font-mono">
                <FolderPlus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-black dark:text-white text-sm mb-1">
                No research workspaces yet
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mb-5 leading-relaxed">
                Create your workspace above or jump straight into uploading your dataset to run Python statistics &amp; generate SPSS syntax.
              </p>
              <Button 
                onClick={() => navigate('/data-analysis')} 
                size="sm"
                className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none px-4 border border-black dark:border-white"
              >
                <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                Launch Statistical Engine <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {/* 1. Saved Data Analyses */}
                {savedAnalyses.map((analysis) => {
                  const testsCount = analysis.tests_run?.length || analysis.computed_stats?.tests_run?.length || 0;
                  const respCount = analysis.n_respondents || analysis.computed_stats?.n_total || 0;
                  const dateStr = new Date(analysis.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });

                  return (
                    <div
                      key={analysis.id}
                      onClick={() => navigate(`/data-analysis?id=${analysis.id}`)}
                      className="border border-black dark:border-zinc-800 p-4 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white flex items-center justify-center font-mono shrink-0 mt-0.5">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="mono-badge text-[10px]">STATISTICAL ENGINE</span>
                            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {dateStr}
                            </span>
                            {respCount > 0 && (
                              <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> n={respCount}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-black dark:text-white group-hover:underline">
                            {analysis.title}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                            Dataset: {analysis.raw_filename} · {testsCount} statistical tests computed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/data-analysis?id=${analysis.id}`);
                          }}
                          className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-white h-8"
                        >
                          Open Analysis <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDeleteAnalysis(e, analysis.id)}
                          className="h-8 w-8 rounded-none text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Writing Projects */}
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    onOpenProject={onOpenProject}
                    onDeleteProject={onDeleteProject}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
