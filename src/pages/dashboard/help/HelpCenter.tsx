import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LifeBuoy, Search, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FEATURED_ARTICLES, getHelpArticle, HELP_TOPICS, searchHelp } from "@/content/vendor-help";
import { HelpTopicIcon } from "./help-ui";

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchHelp(query), [query]);
  const featured = FEATURED_ARTICLES.map(([topicSlug, articleSlug]) => getHelpArticle(topicSlug, articleSlug))
    .filter((item) => item.topic && item.article);

  return (
    <DashboardLayout pageTitle="Help & Support">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl bg-gray-950 px-5 py-10 text-center text-white sm:px-8 md:py-14">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <LifeBuoy size={25} />
          </div>
          <h1 className="text-3xl font-bold md:text-5xl">How can we help?</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
            Find instructions for Printa vendor onboarding, stores, print jobs, till sales, inventory, staff, and subscriptions.
          </p>
          <div className="relative mx-auto mt-7 max-w-2xl text-gray-900">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help, for example: custom inventory"
              aria-label="Search Printa help"
              className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-12 text-sm shadow-xl outline-none transition focus:ring-2 focus:ring-printa-red"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear help search" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={17} />
              </button>
            )}
          </div>
          <Link to="/dashboard/help/faq" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15">
            Browse frequently asked questions <ArrowRight size={14} />
          </Link>
        </header>

        {query.trim() ? (
          <section aria-live="polite">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Search results</h2>
                <p className="mt-1 text-sm text-gray-500">{results.length} {results.length === 1 ? "article" : "articles"} found</p>
              </div>
            </div>
            {results.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {results.map(({ topic, article }) => (
                  <Link key={`${topic.slug}/${article.slug}`} to={`/dashboard/help/${topic.slug}/${article.slug}`} className="group rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-printa-red">{topic.title}</p>
                    <h3 className="mt-2 font-bold text-gray-900 group-hover:text-printa-red">{article.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{article.summary}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                <h3 className="font-semibold text-gray-900">No matching help article</h3>
                <p className="mt-2 text-sm text-gray-500">Try a shorter search or send the issue to Printa Support.</p>
                <Link to="/dashboard/support" className="mt-5 inline-flex items-center gap-2 font-semibold text-printa-red">Contact support <ArrowRight size={16} /></Link>
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <h2 className="mb-5 text-xl font-bold text-gray-900 md:text-2xl">Browse by topic</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {HELP_TOPICS.map((topic) => (
                  <Link key={topic.slug} to={`/dashboard/help/${topic.slug}`} className="group rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-printa-red/10 text-printa-red"><HelpTopicIcon name={topic.icon} /></div>
                    <h3 className="mt-4 font-bold text-gray-900 group-hover:text-printa-red">{topic.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{topic.description}</p>
                    <p className="mt-4 text-xs font-semibold text-gray-400">{topic.articles.length} {topic.articles.length === 1 ? "article" : "articles"}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-xl font-bold text-gray-900 md:text-2xl">Start here</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {featured.map(({ topic, article }) => topic && article && (
                  <Link key={`${topic.slug}/${article.slug}`} to={`/dashboard/help/${topic.slug}/${article.slug}`} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-gray-200 hover:shadow-sm">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><HelpTopicIcon name={topic.icon} size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-400">{topic.title}</p>
                      <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-printa-red">{article.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{article.summary}</p>
                    </div>
                    <ArrowRight className="mt-2 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-printa-red" size={18} />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-printa-red p-6 text-white sm:flex-row sm:items-center md:p-8">
          <div>
            <h2 className="text-xl font-bold">Need help with a specific account or order?</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/75">Send a support request from your signed-in vendor account so Printa can identify the requester and investigate.</p>
          </div>
          <Link to="/dashboard/support" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-100">Contact support <ArrowRight size={17} /></Link>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
