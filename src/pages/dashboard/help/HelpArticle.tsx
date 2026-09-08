import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Info } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getHelpArticle } from "@/content/vendor-help";

const HelpArticle = () => {
  const { topicSlug, articleSlug } = useParams();
  const { topic, article } = getHelpArticle(topicSlug, articleSlug);

  if (!topic || !article) return <Navigate to="/dashboard/help" replace />;

  return (
    <DashboardLayout pageTitle={article.title}>
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link to="/dashboard/help" className="hover:text-gray-900">Help & Support</Link>
          <ChevronRight size={13} />
          <Link to={`/dashboard/help/${topic.slug}`} className="hover:text-gray-900">{topic.title}</Link>
          <ChevronRight size={13} />
          <span className="max-w-[220px] truncate font-medium text-gray-900 sm:max-w-none">{article.title}</span>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
          <header className="border-b border-gray-100 p-6 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-wider text-printa-red">{topic.title}</p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">{article.title}</h1>
            <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">{article.summary}</p>
          </header>

          <div className="p-6 md:p-9">
            <h2 className="text-lg font-bold text-gray-900">What to do</h2>
            <ol className="mt-5 space-y-5">
              {article.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-printa-red text-xs font-bold text-white">{index + 1}</span>
                  <p className="pt-1 text-sm leading-6 text-gray-700">{step}</p>
                </li>
              ))}
            </ol>

            {article.notes && article.notes.length > 0 && (
              <aside className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <div className="flex items-center gap-2 font-semibold text-amber-900"><Info size={18} /> Keep in mind</div>
                <ul className="mt-3 space-y-2">
                  {article.notes.map((note) => <li key={note} className="flex gap-2 text-sm leading-6 text-amber-900/80"><Check className="mt-1 shrink-0" size={14} />{note}</li>)}
                </ul>
              </aside>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
              {article.action && (
                <Link to={article.action.path} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800">{article.action.label} <ArrowRight size={16} /></Link>
              )}
              <Link to={`/dashboard/help/${topic.slug}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"><ArrowLeft size={16} /> All {topic.title.toLowerCase()} articles</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-100 p-5 sm:flex-row sm:items-center">
          <div><p className="font-semibold text-gray-900">Did this not solve the problem?</p><p className="mt-1 text-xs text-gray-500">Include the store, route, time, order ID where relevant, and exact error message.</p></div>
          <Link to="/dashboard/support" className="shrink-0 text-sm font-bold text-printa-red hover:text-gray-900">Contact support</Link>
        </div>
      </article>
    </DashboardLayout>
  );
};

export default HelpArticle;
