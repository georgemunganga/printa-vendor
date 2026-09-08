import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getHelpTopic } from "@/content/vendor-help";
import { HelpTopicIcon } from "./help-ui";

const HelpTopic = () => {
  const { topicSlug } = useParams();
  const topic = getHelpTopic(topicSlug);

  if (!topic) return <Navigate to="/dashboard/help" replace />;

  return (
    <DashboardLayout pageTitle={topic.title}>
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link to="/dashboard/help" className="hover:text-gray-900">Help & Support</Link>
          <ChevronRight size={13} />
          <span className="font-medium text-gray-900">{topic.title}</span>
        </nav>

        <header className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-printa-red/10 text-printa-red"><HelpTopicIcon name={topic.icon} size={24} /></div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900 md:text-4xl">{topic.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">{topic.description}</p>
        </header>

        <section className="mt-6 space-y-3">
          <h2 className="px-1 text-lg font-bold text-gray-900">Articles</h2>
          {topic.articles.map((article, index) => (
            <Link key={article.slug} to={`/dashboard/help/${topic.slug}/${article.slug}`} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-gray-200 hover:shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-printa-red">{article.title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">{article.summary}</p>
              </div>
              <ArrowRight className="mt-1 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-printa-red" size={18} />
            </Link>
          ))}
        </section>

        <div className="mt-8 rounded-2xl bg-gray-950 p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h2 className="font-bold">Still need help?</h2>
            <p className="mt-1 text-sm text-white/65">Send the issue and its exact error message to Printa Support.</p>
          </div>
          <Link to="/dashboard/support" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-900 md:mt-0">Contact support <ArrowRight size={16} /></Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpTopic;
