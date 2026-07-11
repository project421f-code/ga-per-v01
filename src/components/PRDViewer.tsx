import { useState } from "react";
import { prdSections } from "../mockData";
import MarkdownRenderer from "./MarkdownRenderer";
import * as LucideIcons from "lucide-react";

export default function PRDViewer() {
  const [activeSection, setActiveSection] = useState(prdSections[0].id);

  const currentSection = prdSections.find((s) => s.id === activeSection) || prdSections[0];

  // Helper to render Lucide icon dynamically
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.FileText className="w-5 h-5" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row h-full min-h-[600px]">
      {/* Document Navigation */}
      <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="mb-6">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            DOKUMEN PRD RESMI
          </span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            GA Performance Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dokumen Persyaratan Produk (PRD) v1.0
          </p>
        </div>

        <nav className="space-y-1">
          {prdSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-600"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {renderIcon(section.icon)}
              <span className="truncate">{section.title}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
            <LucideIcons.HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Tentang GAS
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            GAS (Google AI Studio) digunakan untuk membangun dan memproses kecerdasan operasional pada modul AI Advisor.
          </p>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[700px] bg-white dark:bg-slate-900">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            {renderIcon(currentSection.icon)}
            <span>Spesifikasi Produk</span>
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            {currentSection.title}
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={currentSection.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
